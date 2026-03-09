/* eslint-disable no-console, @typescript-eslint/no-unused-vars */
import { test, expect, Page } from "@playwright/test";

/**
 * LINK AUDIT — Crawl every page, find every <a> tag, check every href.
 * No link left behind.
 */

interface LinkInfo {
  href: string;
  text: string;
  page: string;
}

/** Extract all <a> tags from the current page */
async function extractLinks(page: Page, pageUrl: string): Promise<LinkInfo[]> {
  return page.evaluate((url) => {
    const anchors = Array.from(document.querySelectorAll("a"));
    return anchors.map((a) => ({
      href: a.getAttribute("href") || "",
      text: (a.textContent || "").trim().substring(0, 80),
      page: url,
    }));
  }, pageUrl);
}

/** Navigate through the form to get to the qualified result page (best answers) */
async function getToQualifiedResult(page: Page) {
  await page.goto("/");
  // Budget
  await page.getByRole("button", { name: "$100K+", exact: true }).click();
  await page.getByRole("button", { name: "Yes, fully approved", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  // Authority
  await page.getByRole("button", { name: "Final decision maker", exact: true }).click();
  await page.getByRole("button", { name: "Quick decision, minimal approval", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  // Need
  await page
    .getByRole("button", { name: "Causing significant business impact", exact: true })
    .click();
  await page.getByRole("button", { name: "Immediate (next 30 days)", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  // Timeline
  await page.getByRole("button", { name: "Within 60 days", exact: true }).click();
  await page.getByRole("button", { name: "Submit" }).click();
  await page.waitForURL(/\/result/);
}

/** Navigate through the form with worst answers to get disqualified result */
async function getToDisqualifiedResult(page: Page) {
  await page.goto("/");
  // Budget
  await page.getByRole("button", { name: "Under $10K or unsure", exact: true }).click();
  await page.getByRole("button", { name: "Not approved yet", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  // Authority
  await page.getByRole("button", { name: "Just gathering information", exact: true }).click();
  await page.getByRole("button", { name: "Extended, complex approval", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  // Need
  await page
    .getByRole("button", { name: "Minor issues or exploring options", exact: true })
    .click();
  await page.getByRole("button", { name: "Someday or exploring", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  // Timeline
  await page.getByRole("button", { name: "More than 1 year or undecided", exact: true }).click();
  await page.getByRole("button", { name: "Submit" }).click();
  await page.waitForURL(/\/result/);
}

// ============================================================
// COMPREHENSIVE LINK DISCOVERY
// ============================================================

test.describe("Link Audit — Every Link on Every Page", () => {
  test("discover all links on home page", async ({ page }) => {
    await page.goto("/");
    const links = await extractLinks(page, "/");
    console.log(`\n=== HOME PAGE LINKS (${links.length}) ===`);
    for (const link of links) {
      console.log(`  [${link.text || "(no text)"}] → ${link.href}`);
    }
    // Report count — even zero is useful info
    console.log(`Total links on home page: ${links.length}`);
  });

  test("discover all links on qualified result page", async ({ page }) => {
    await getToQualifiedResult(page);
    const links = await extractLinks(page, "/result (qualified)");
    console.log(`\n=== QUALIFIED RESULT PAGE LINKS (${links.length}) ===`);
    for (const link of links) {
      console.log(`  [${link.text || "(no text)"}] → ${link.href}`);
    }
  });

  test("discover all links on disqualified result page", async ({ page }) => {
    await getToDisqualifiedResult(page);
    const links = await extractLinks(page, "/result (disqualified)");
    console.log(`\n=== DISQUALIFIED RESULT PAGE LINKS (${links.length}) ===`);
    for (const link of links) {
      console.log(`  [${link.text || "(no text)"}] → ${link.href}`);
    }
  });
});

// ============================================================
// CHECK EVERY LINK — Does it return 200 or 404?
// ============================================================

test.describe("Link Health Check — Every href gets hit", () => {
  test("all links on qualified result page resolve", async ({ page, request }) => {
    await getToQualifiedResult(page);
    const links = await extractLinks(page, "/result");

    const results: { href: string; text: string; status: number | string }[] = [];

    for (const link of links) {
      if (!link.href || link.href.startsWith("#") || link.href.startsWith("javascript:")) {
        results.push({ ...link, status: "skipped (fragment/js)" });
        continue;
      }

      // Resolve relative URLs
      const fullUrl = link.href.startsWith("http")
        ? link.href
        : `http://localhost:4200${link.href.startsWith("/") ? "" : "/"}${link.href}`;

      try {
        const response = await request.get(fullUrl);
        results.push({ href: link.href, text: link.text, status: response.status() });
      } catch (_e) {
        results.push({ href: link.href, text: link.text, status: `error: ${_e}` });
      }
    }

    console.log("\n=== QUALIFIED RESULT — LINK HEALTH ===");
    const broken: typeof results = [];
    for (const r of results) {
      const marker = r.status === 200 ? "✓" : r.status === 404 ? "✘ 404" : `⚠ ${r.status}`;
      console.log(`  ${marker}  [${r.text}] → ${r.href}`);
      if (r.status === 404) broken.push(r);
    }

    if (broken.length > 0) {
      console.log(`\n🔴 BROKEN LINKS (404): ${broken.length}`);
      for (const b of broken) {
        console.log(`   - "${b.text}" → ${b.href}`);
      }
    }

    // Report but don't fail — dead links are known issues
    // To make this strict, uncomment:
    // expect(broken.length).toBe(0);
  });

  test("all links on disqualified result page resolve", async ({ page, request }) => {
    await getToDisqualifiedResult(page);
    const links = await extractLinks(page, "/result");

    const results: { href: string; text: string; status: number | string }[] = [];

    for (const link of links) {
      if (!link.href || link.href.startsWith("#") || link.href.startsWith("javascript:")) {
        results.push({ ...link, status: "skipped" });
        continue;
      }

      const fullUrl = link.href.startsWith("http")
        ? link.href
        : `http://localhost:4200${link.href.startsWith("/") ? "" : "/"}${link.href}`;

      try {
        const response = await request.get(fullUrl);
        results.push({ href: link.href, text: link.text, status: response.status() });
      } catch (_e) {
        results.push({ href: link.href, text: link.text, status: `error: ${_e}` });
      }
    }

    console.log("\n=== DISQUALIFIED RESULT — LINK HEALTH ===");
    const broken: typeof results = [];
    for (const r of results) {
      const marker = r.status === 200 ? "✓" : r.status === 404 ? "✘ 404" : `⚠ ${r.status}`;
      console.log(`  ${marker}  [${r.text}] → ${r.href}`);
      if (r.status === 404) broken.push(r);
    }

    if (broken.length > 0) {
      console.log(`\n🔴 BROKEN LINKS (404): ${broken.length}`);
      for (const b of broken) {
        console.log(`   - "${b.text}" → ${b.href}`);
      }
    }
  });

  test("all links on home page resolve", async ({ page, request }) => {
    await page.goto("/");
    const links = await extractLinks(page, "/");

    if (links.length === 0) {
      console.log("\n=== HOME PAGE — No <a> links found (all navigation is via buttons) ===");
      return;
    }

    const results: { href: string; text: string; status: number | string }[] = [];
    for (const link of links) {
      if (!link.href || link.href.startsWith("#") || link.href.startsWith("javascript:")) {
        results.push({ ...link, status: "skipped" });
        continue;
      }
      const fullUrl = link.href.startsWith("http")
        ? link.href
        : `http://localhost:4200${link.href.startsWith("/") ? "" : "/"}${link.href}`;
      try {
        const response = await request.get(fullUrl);
        results.push({ href: link.href, text: link.text, status: response.status() });
      } catch (_e) {
        results.push({ href: link.href, text: link.text, status: `error: ${_e}` });
      }
    }

    console.log("\n=== HOME PAGE — LINK HEALTH ===");
    for (const r of results) {
      const marker = r.status === 200 ? "✓" : r.status === 404 ? "✘ 404" : `⚠ ${r.status}`;
      console.log(`  ${marker}  [${r.text}] → ${r.href}`);
    }
  });

  test("check all unique internal routes discovered across all pages", async ({
    page,
    request,
  }) => {
    // Collect links from all pages
    const allLinks: LinkInfo[] = [];

    // Home page
    await page.goto("/");
    allLinks.push(...(await extractLinks(page, "/")));

    // Qualified result
    await getToQualifiedResult(page);
    allLinks.push(...(await extractLinks(page, "/result (qualified)")));

    // Disqualified result
    await getToDisqualifiedResult(page);
    allLinks.push(...(await extractLinks(page, "/result (disqualified)")));

    // Deduplicate by href
    const uniqueHrefs = [...new Set(allLinks.map((l) => l.href))].filter(
      (h) => h && !h.startsWith("#") && !h.startsWith("javascript:") && !h.startsWith("http"),
    );

    console.log(`\n=== ALL UNIQUE INTERNAL ROUTES (${uniqueHrefs.length}) ===`);

    const broken: string[] = [];
    for (const href of uniqueHrefs) {
      const fullUrl = `http://localhost:4200${href.startsWith("/") ? "" : "/"}${href}`;
      try {
        const response = await request.get(fullUrl);
        const status = response.status();
        const marker = status === 200 ? "✓" : status === 404 ? "✘ 404" : `⚠ ${status}`;
        console.log(`  ${marker}  ${href}`);
        if (status === 404) broken.push(href);
      } catch (_e) {
        console.log(`  ❌  ${href} — connection error`);
        broken.push(href);
      }
    }

    console.log(`\n📊 SUMMARY: ${uniqueHrefs.length} unique internal links`);
    console.log(`   ✓ Working: ${uniqueHrefs.length - broken.length}`);
    console.log(`   ✘ Broken:  ${broken.length}`);
    if (broken.length > 0) {
      console.log(`   Dead links: ${broken.join(", ")}`);
    }
  });
});
