import { expect, test } from "@playwright/test";

test("startup smoke renders core shells", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "EarthPulse" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Local Conditions" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Data Health" })).toBeVisible();
  await expect(page.getByRole("button", { name: "24h Replay" })).toBeVisible();
});

test("settings panel open and close", async ({ page }) => {
  await page.goto("/");
  await page.getByTitle("Settings").click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).not.toBeVisible();
});

test("replay and historical bars toggle", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "24h Replay" }).click();
  await expect(page.getByRole("button", { name: "Exit" })).toBeVisible();
  await page.getByRole("button", { name: "Exit" }).click();

  await page.getByRole("button", { name: "Historical Explorer" }).click();
  await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  await page.getByRole("button", { name: "Exit" }).click();
  await expect(page.getByRole("button", { name: "Historical Explorer" })).toBeVisible();
});
