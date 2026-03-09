/* eslint-disable no-console, @typescript-eslint/no-unused-vars */
import { test, expect } from "@playwright/test";

test("debug DOM structure", async ({ page }) => {
  await page.goto("/");
  // Find all .space-y-4 elements
  const spaceY4 = page.locator(".space-y-4");
  const count = await spaceY4.count();
  console.log(`Found ${count} .space-y-4 elements`);

  // Try the actual question heading selector
  const h3s = page.locator("h3");
  const h3Count = await h3s.count();
  console.log(`Found ${h3Count} h3 elements`);
  for (let i = 0; i < h3Count; i++) {
    console.log(`h3[${i}]: ${await h3s.nth(i).textContent()}`);
  }

  // Find buttons inside question cards - try different selector
  const gridButtons = page.locator(".grid button");
  const btnCount = await gridButtons.count();
  console.log(`Found ${btnCount} grid buttons`);
  for (let i = 0; i < btnCount; i++) {
    const txt = await gridButtons.nth(i).textContent();
    console.log(`btn[${i}]: ${txt?.trim()}`);
  }

  // Try clicking first grid button
  await gridButtons.nth(0).click();
  // Check if it got the blue border
  const hasBlue = await gridButtons.nth(0).evaluate((el) => el.className.includes("border-blue"));
  console.log(`First button has blue border after click: ${hasBlue}`);
});
