use reqwest::{Client, RequestBuilder, Response, StatusCode};
use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

pub static HTTP_CLIENT: LazyLock<Client> = LazyLock::new(|| {
    Client::builder()
        .timeout(Duration::from_secs(15))
        .build()
        .expect("Failed to create HTTP client")
});

#[derive(Debug, Clone, Copy)]
pub enum SourceClass {
    Critical,
    Standard,
    Bulk,
    OnDemand,
}

#[derive(Debug, Clone, Copy)]
struct RetryPolicy {
    max_attempts: u32,
    base_backoff_ms: u64,
    max_backoff_ms: u64,
    trip_after_failures: u32,
    open_seconds: u64,
}

#[derive(Debug, Clone, Copy)]
struct CircuitState {
    consecutive_failures: u32,
    open_until: Option<Instant>,
}

impl Default for CircuitState {
    fn default() -> Self {
        Self {
            consecutive_failures: 0,
            open_until: None,
        }
    }
}

static CIRCUITS: LazyLock<Mutex<HashMap<&'static str, CircuitState>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

fn policy_for(class: SourceClass) -> RetryPolicy {
    match class {
        SourceClass::Critical => RetryPolicy {
            max_attempts: 4,
            base_backoff_ms: 200,
            max_backoff_ms: 2_000,
            trip_after_failures: 6,
            open_seconds: 20,
        },
        SourceClass::Standard => RetryPolicy {
            max_attempts: 3,
            base_backoff_ms: 350,
            max_backoff_ms: 3_000,
            trip_after_failures: 5,
            open_seconds: 40,
        },
        SourceClass::Bulk => RetryPolicy {
            max_attempts: 2,
            base_backoff_ms: 700,
            max_backoff_ms: 4_000,
            trip_after_failures: 4,
            open_seconds: 90,
        },
        SourceClass::OnDemand => RetryPolicy {
            max_attempts: 2,
            base_backoff_ms: 250,
            max_backoff_ms: 1_500,
            trip_after_failures: 4,
            open_seconds: 20,
        },
    }
}

fn jitter_ms() -> u64 {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .subsec_nanos() as u64;
    nanos % 97
}

fn exponential_backoff_ms(policy: RetryPolicy, attempt: u32) -> u64 {
    let exponent = attempt.saturating_sub(1).min(6);
    let backoff = policy
        .base_backoff_ms
        .saturating_mul(2_u64.saturating_pow(exponent));
    backoff
        .min(policy.max_backoff_ms)
        .saturating_add(jitter_ms())
}

fn should_retry(err: &reqwest::Error) -> bool {
    if err.is_timeout() || err.is_connect() {
        return true;
    }

    if let Some(status) = err.status() {
        return status.is_server_error()
            || status == StatusCode::TOO_MANY_REQUESTS
            || status == StatusCode::REQUEST_TIMEOUT;
    }

    false
}

fn error_class(err: &reqwest::Error) -> &'static str {
    if err.is_timeout() {
        "timeout"
    } else if err.is_connect() {
        "connect"
    } else if let Some(status) = err.status() {
        if status == StatusCode::TOO_MANY_REQUESTS {
            "rate_limited"
        } else if status.is_server_error() {
            "upstream_5xx"
        } else if status.is_client_error() {
            "upstream_4xx"
        } else {
            "http_error"
        }
    } else {
        "network_error"
    }
}

fn is_circuit_open(source: &'static str) -> bool {
    let circuits = CIRCUITS.lock().unwrap();
    circuits
        .get(source)
        .and_then(|state| state.open_until)
        .map(|until| until > Instant::now())
        .unwrap_or(false)
}

fn record_success(source: &'static str) {
    let mut circuits = CIRCUITS.lock().unwrap();
    if let Some(state) = circuits.get_mut(source) {
        state.consecutive_failures = 0;
        state.open_until = None;
    }
}

fn record_failure(source: &'static str, policy: RetryPolicy) {
    let mut circuits = CIRCUITS.lock().unwrap();
    let state = circuits.entry(source).or_default();
    state.consecutive_failures = state.consecutive_failures.saturating_add(1);
    if state.consecutive_failures >= policy.trip_after_failures {
        state.open_until = Some(Instant::now() + Duration::from_secs(policy.open_seconds));
    }
}

pub async fn send_with_resilience<F>(
    source: &'static str,
    class: SourceClass,
    context: &'static str,
    build: F,
) -> Result<Response, String>
where
    F: Fn() -> RequestBuilder,
{
    let policy = policy_for(class);

    if is_circuit_open(source) {
        return Err(format!(
            "{} temporarily unavailable (circuit open after repeated failures)",
            context
        ));
    }

    for attempt in 1..=policy.max_attempts {
        let result = build()
            .send()
            .await
            .and_then(|response| response.error_for_status());

        match result {
            Ok(response) => {
                if attempt > 1 {
                    log::warn!("{} recovered after {} attempts", source, attempt);
                }
                record_success(source);
                return Ok(response);
            }
            Err(err) => {
                let retryable = should_retry(&err);
                let err_class = error_class(&err);

                if !retryable || attempt == policy.max_attempts {
                    record_failure(source, policy);
                    return Err(format!("{} failed ({})", context, err_class));
                }

                let sleep_ms = exponential_backoff_ms(policy, attempt);
                log::warn!(
                    "{} attempt {}/{} failed ({}), retrying in {}ms",
                    source,
                    attempt,
                    policy.max_attempts,
                    err_class,
                    sleep_ms
                );
                tokio::time::sleep(Duration::from_millis(sleep_ms)).await;
            }
        }
    }

    Err(format!("{} failed after retries", context))
}
