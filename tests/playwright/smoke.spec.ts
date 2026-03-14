import { expect, test } from "@playwright/test";

function collectErrors(
  page: Parameters<typeof test>[0]["page"],
  errors: string[],
) {
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  page.on("pageerror", (error) => {
    errors.push(error.message);
  });
}

test("startup smoke renders core shells without console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  collectErrors(page, errors);

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "EarthPulse" })).toBeVisible();
  await expect(
    page.getByText("Browser preview uses mocked desktop data", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Local Conditions" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Data Health" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "24h Replay" })).toBeVisible();
  await expect(page.getByText("Preview data")).toBeVisible();
  expect(errors).toEqual([]);
});

test("settings panel saves and persists in browser preview", async ({
  page,
}) => {
  const errors: string[] = [];
  collectErrors(page, errors);

  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  const modelInput = page.getByLabel("Ollama model");
  await modelInput.fill("llama3.3");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(
    page.getByRole("heading", { name: "Settings" }),
  ).not.toBeVisible();

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByLabel("Ollama model")).toHaveValue("llama3.3");
  await page.getByRole("button", { name: "Cancel" }).click();
  expect(errors).toEqual([]);
});

test("replay, historical search, and watchlists work in preview mode", async ({
  page,
}) => {
  const errors: string[] = [];
  collectErrors(page, errors);

  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "24h Replay" }).click();
  await expect(page.getByRole("button", { name: "Exit" })).toBeVisible();
  await page.getByRole("button", { name: "Exit" }).click();

  await page.getByRole("button", { name: "Historical Explorer" }).click();
  await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText(/^\d+ quakes$/i)).toBeVisible();
  await page.getByRole("button", { name: "Exit" }).click();
  await expect(
    page.getByRole("button", { name: "Historical Explorer" }),
  ).toBeVisible();

  await page.getByLabel("Watchlist name").fill("Pacific Rim");
  await page.getByLabel("Watchlist latitude").fill("34.05");
  await page.getByLabel("Watchlist longitude").fill("-118.25");
  await page.getByLabel("Watchlist radius").fill("750");
  await page.getByRole("button", { name: "Add Watchlist" }).click();
  await expect(
    page.getByRole("complementary").getByText("Pacific Rim"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Remove Pacific Rim" }).click();
  await expect(
    page.getByRole("complementary").getByText("Pacific Rim"),
  ).not.toBeVisible();
  expect(errors).toEqual([]);
});
