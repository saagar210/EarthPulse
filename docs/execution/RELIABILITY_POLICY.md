# Runtime Reliability Policy

## Network Resilience
All HTTP fetchers now route through shared resilient transport in `src-tauri/src/fetchers/http.rs`.

Policy by source class:
1. `Critical` (e.g. earthquakes, ISS): more retries, shorter circuit timeout.
2. `Standard` (e.g. GDACS, solar, volcanoes): balanced retries and backoff.
3. `Bulk` (e.g. asteroid, solar activity, EONET): fewer retries, longer cooldown.
4. `OnDemand` (e.g. weather, air quality, SST, historical queries): lightweight retries.

## Circuit Breaker Rules
1. Repeated failures trip a source-local circuit.
2. Open circuits fail fast to prevent request storms.
3. Successful requests reset failure counters.

## Error Taxonomy
Sanitized error classes are used for user-safe messaging and logs:
1. `timeout`
2. `connect`
3. `rate_limited`
4. `upstream_5xx`
5. `upstream_4xx`
6. `network_error`

## Degraded Data Handling
When a source falls back to curated/static data:
1. Source health emits `ok=true` and `degraded=true`.
2. UI marks source as `stale` with degraded reason and age.
3. Recovery clears degraded state automatically after successful live fetch.
