use reqwest::Client;
use std::sync::LazyLock;
use std::time::Duration;

pub static HTTP_CLIENT: LazyLock<Client> = LazyLock::new(|| {
    Client::builder()
        .timeout(Duration::from_secs(15))
        .build()
        .expect("Failed to create HTTP client")
});
