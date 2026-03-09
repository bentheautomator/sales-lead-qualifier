import { test, expect, Page } from "@playwright/test";

// ============================================================
// HELPERS
// ============================================================

const DIMENSIONS = [
  { name: "Budget", questions: 2, optionsPerQ: 4 },
  { name: "Authority", questions: 2, optionsPerQ: 4 },
  { name: "Need", questions: 2, optionsPerQ: 4 },
  { name: "Timeline", questions: 1, optionsPerQ: 4 },
] as const;

/** Click an option button by its visible label text */
async function selectOptionByLabel(page: Page, optionLabel: string) {
  await page.getByRole("button", { name: optionLabel, exact: true }).click();
}

/** Click the Next button (exact match to avoid Next.js dev tools button) */
async function clickNext(page: Page) {
  await page.getByRole("button", { name: "Next", exact: true }).click();
}

/** Select the first option for every question on the current dimension */
async function selectAllFirstOptions(page: Page, questionCount: number) {
  const gridButtons = page.locator(".grid button");
  for (let q = 0; q < questionCount; q++) {
    await gridButtons.nth(q * 4).click();
  }
}

/** Select the last option for every question */
async function selectAllLastOptions(page: Page, questionCount: number) {
  const gridButtons = page.locator(".grid button");
  for (let q = 0; q < questionCount; q++) {
    await gridButtons.nth(q * 4 + 3).click();
  }
}

/** Check if a button appears selected (has the active blue bg, not just hover) */
async function expectSelected(page: Page, label: string) {
  const btn = page.getByRole("button", { name: label, exact: true });
  // Selected buttons get bg-blue-50 (light) or ring-2 (both modes)
  await expect(btn).toHaveClass(/ring-2/);
}

/** Check if a button appears unselected */
async function expectNotSelected(page: Page, label: string) {
  const btn = page.getByRole("button", { name: label, exact: true });
  await expect(btn).not.toHaveClass(/ring-2/);
}

/** Walk through entire form selecting best answers and submit */
async function completeFormWithBestAnswers(page: Page) {
  for (let step = 0; step < DIMENSIONS.length; step++) {
    await selectAllFirstOptions(page, DIMENSIONS[step].questions);
    if (step < DIMENSIONS.length - 1) {
      await clickNext(page);
    }
  }
  await page.getByRole("button", { name: "Submit" }).click();
  await page.waitForURL(/\/result/);
}

/** Walk through entire form selecting worst answers and submit */
async function completeFormWithWorstAnswers(page: Page) {
  for (let step = 0; step < DIMENSIONS.length; step++) {
    await selectAllLastOptions(page, DIMENSIONS[step].questions);
    if (step < DIMENSIONS.length - 1) {
      await clickNext(page);
    }
  }
  await page.getByRole("button", { name: "Submit" }).click();
  await page.waitForURL(/\/result/);
}

// ============================================================
// 1. PAGE LOAD & BASIC RENDERING
// ============================================================

test.describe("Page Load & Rendering", () => {
  test("home page loads with title and heading", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Sales Lead/i);
    await expect(page.getByRole("heading", { name: /Sales Lead Qualifier/i })).toBeVisible();
  });

  test("home page shows subtitle", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/right fit for your business/i)).toBeVisible();
  });

  test("progress bar shows step 1 of 4", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Step 1 of 4")).toBeVisible();
  });

  test("progress bar shows dimension names", async ({ page }) => {
    await page.goto("/");
    // The progress bar nav contains step labels
    const nav = page.getByRole("navigation", { name: /progress/i });
    for (const dim of DIMENSIONS) {
      await expect(nav.getByText(dim.name)).toBeVisible();
    }
  });

  test("no console errors on home page", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });

  test("no failed network requests on home page", async ({ page }) => {
    const failures: string[] = [];
    page.on("requestfailed", (req) => failures.push(req.url()));
    await page.goto("/");
    await page.waitForTimeout(2000);
    expect(failures).toEqual([]);
  });
});

// ============================================================
// 2. PROGRESS BAR BEHAVIOR
// ============================================================

test.describe("Progress Bar", () => {
  test("progress bar has ARIA attributes", async ({ page }) => {
    await page.goto("/");
    const progressbar = page.getByRole("progressbar");
    await expect(progressbar).toBeVisible();
    await expect(progressbar).toHaveAttribute("aria-valuenow", "25");
    await expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    await expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  test("progress bar advances on Next click", async ({ page }) => {
    await page.goto("/");
    await selectAllFirstOptions(page, DIMENSIONS[0].questions);
    await clickNext(page);
    await expect(page.getByText("Step 2 of 4")).toBeVisible();
    const progressbar = page.getByRole("progressbar");
    await expect(progressbar).toHaveAttribute("aria-valuenow", "50");
  });

  test("step indicator highlights current step", async ({ page }) => {
    await page.goto("/");
    const stepIndicator = page.locator('[aria-current="step"]');
    await expect(stepIndicator).toHaveText("1");
  });
});

// ============================================================
// 3. BUTTON STATE & NAVIGATION
// ============================================================

test.describe("Button State & Navigation", () => {
  test("Back button disabled on first step", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Back" })).toBeDisabled();
  });

  test("Next button disabled until all questions answered", async ({ page }) => {
    await page.goto("/");
    const nextBtn = page.getByRole("button", { name: "Next", exact: true });
    await expect(nextBtn).toBeDisabled();

    // Answer only first question
    await selectOptionByLabel(page, "$100K+");
    await expect(nextBtn).toBeDisabled();

    // Answer second question
    await selectOptionByLabel(page, "Yes, fully approved");
    await expect(nextBtn).toBeEnabled();
  });

  test("Back button enabled after moving to step 2", async ({ page }) => {
    await page.goto("/");
    await selectAllFirstOptions(page, DIMENSIONS[0].questions);
    await clickNext(page);
    await expect(page.getByRole("button", { name: "Back" })).toBeEnabled();
  });

  test("Back button preserves answers", async ({ page }) => {
    await page.goto("/");
    await selectOptionByLabel(page, "$100K+");
    await selectOptionByLabel(page, "Yes, fully approved");
    await clickNext(page);
    await page.getByRole("button", { name: "Back" }).click();
    await expectSelected(page, "$100K+");
  });

  test("Submit button appears only on last step", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /Submit/i })).not.toBeVisible();

    for (let i = 0; i < DIMENSIONS.length - 1; i++) {
      await selectAllFirstOptions(page, DIMENSIONS[i].questions);
      await clickNext(page);
    }
    await expect(page.getByRole("button", { name: /Submit/i })).toBeVisible();
  });

  test("Submit button disabled until last question answered", async ({ page }) => {
    await page.goto("/");
    for (let i = 0; i < DIMENSIONS.length - 1; i++) {
      await selectAllFirstOptions(page, DIMENSIONS[i].questions);
      await clickNext(page);
    }
    await expect(page.getByRole("button", { name: /Submit/i })).toBeDisabled();
  });
});

// ============================================================
// 4. QUESTION CARD INTERACTION
// ============================================================

test.describe("Question Card Interaction", () => {
  test("clicking option selects it with visual indicator", async ({ page }) => {
    await page.goto("/");
    await selectOptionByLabel(page, "$100K+");
    await expectSelected(page, "$100K+");
  });

  test("clicking different option deselects previous", async ({ page }) => {
    await page.goto("/");
    await selectOptionByLabel(page, "$100K+");
    await expectSelected(page, "$100K+");

    await selectOptionByLabel(page, "$25K - $100K");
    await expectSelected(page, "$25K - $100K");
    await expectNotSelected(page, "$100K+");
  });

  test("all option labels are visible for Budget step", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "$100K+" })).toBeVisible();
    await expect(page.getByRole("button", { name: "$25K - $100K" })).toBeVisible();
    await expect(page.getByRole("button", { name: "$10K - $25K" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Under $10K or unsure" })).toBeVisible();
  });

  test("question text is visible", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("What's your annual budget for solutions in this area?"),
    ).toBeVisible();
  });

  test("both Budget questions are visible on step 1", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/annual budget/i)).toBeVisible();
    await expect(page.getByText(/budget already approved/i)).toBeVisible();
  });
});

// ============================================================
// 5. FULL HAPPY PATH — QUALIFIED
// ============================================================

test.describe("Full Happy Path — Qualified", () => {
  test("all best answers → qualified result", async ({ page }) => {
    await page.goto("/");
    await completeFormWithBestAnswers(page);
    await expect(page.getByText(/great news/i)).toBeVisible();
  });

  test("qualified result shows score of 100", async ({ page }) => {
    await page.goto("/");
    await completeFormWithBestAnswers(page);
    await expect(page.locator(".text-5xl")).toHaveText("100");
    await expect(page.getByText("/ 100")).toBeVisible();
  });

  test("qualified result shows BANT breakdown", async ({ page }) => {
    await page.goto("/");
    await completeFormWithBestAnswers(page);
    await expect(page.getByText("Your BANT Breakdown")).toBeVisible();
    await expect(page.getByText("budget")).toBeVisible();
    await expect(page.getByText("authority")).toBeVisible();
    await expect(page.getByText("need")).toBeVisible();
    await expect(page.getByText("timeline")).toBeVisible();
  });

  test("qualified result shows CTA button", async ({ page }) => {
    await page.goto("/");
    await completeFormWithBestAnswers(page);
    await expect(page.getByText("Book a Strategy Call")).toBeVisible();
  });

  test("qualified result has start over link", async ({ page }) => {
    await page.goto("/");
    await completeFormWithBestAnswers(page);
    await expect(page.getByText("Start Over")).toBeVisible();
  });

  test("start over link goes back to home", async ({ page }) => {
    await page.goto("/");
    await completeFormWithBestAnswers(page);
    await page.getByText("Start Over").click();
    await expect(page).toHaveURL("/");
  });

  test("no console errors on qualified result page", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    await completeFormWithBestAnswers(page);
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });
});

// ============================================================
// 6. FULL HAPPY PATH — DISQUALIFIED
// ============================================================

test.describe("Full Happy Path — Disqualified", () => {
  test("all worst answers → disqualified result", async ({ page }) => {
    await page.goto("/");
    await completeFormWithWorstAnswers(page);
    await expect(page.getByText(/thanks for your interest/i)).toBeVisible();
  });

  test("disqualified result shows low score", async ({ page }) => {
    await page.goto("/");
    await completeFormWithWorstAnswers(page);
    const scoreText = await page.locator(".text-5xl").textContent();
    expect(parseInt(scoreText || "100", 10)).toBeLessThan(70);
  });

  test("disqualified shows download CTA", async ({ page }) => {
    await page.goto("/");
    await completeFormWithWorstAnswers(page);
    await expect(page.getByText("Download Our Free Guide")).toBeVisible();
  });

  test("disqualified has breakdown section", async ({ page }) => {
    await page.goto("/");
    await completeFormWithWorstAnswers(page);
    await expect(page.getByText("Your BANT Breakdown")).toBeVisible();
  });

  test("disqualified uses amber color theme", async ({ page }) => {
    await page.goto("/");
    await completeFormWithWorstAnswers(page);
    // The header div has border-amber-200 (light) or border-amber-800 (dark)
    const amberBorder = page.locator('[class*="border-amber"]').first();
    await expect(amberBorder).toBeVisible();
  });
});

// ============================================================
// 7. MIXED ANSWERS — BOUNDARY TESTING
// ============================================================

test.describe("Boundary & Mixed Answers", () => {
  test("mixed answers near threshold → qualified", async ({ page }) => {
    await page.goto("/");
    await selectOptionByLabel(page, "$25K - $100K");
    await selectOptionByLabel(page, "Likely to be approved");
    await clickNext(page);
    await selectOptionByLabel(page, "Key influencer/evaluator");
    await selectOptionByLabel(page, "Standard process with clear steps");
    await clickNext(page);
    await selectOptionByLabel(page, "Creating real productivity challenges");
    await selectOptionByLabel(page, "This quarter");
    await clickNext(page);
    await selectOptionByLabel(page, "Within 6 months");
    await page.getByRole("button", { name: "Submit" }).click();
    await page.waitForURL(/\/result/);
    await expect(page.getByText(/great news/i)).toBeVisible();
  });

  test("barely disqualified answers", async ({ page }) => {
    await page.goto("/");
    await selectOptionByLabel(page, "$10K - $25K");
    await selectOptionByLabel(page, "Still needs review");
    await clickNext(page);
    await selectOptionByLabel(page, "Contributor to evaluation");
    await selectOptionByLabel(page, "Formal RFP and evaluation");
    await clickNext(page);
    await selectOptionByLabel(page, "Noticeable inefficiencies");
    await selectOptionByLabel(page, "This year");
    await clickNext(page);
    await selectOptionByLabel(page, "Within 1 year");
    await page.getByRole("button", { name: "Submit" }).click();
    await page.waitForURL(/\/result/);
    await expect(page.getByText(/thanks for your interest/i)).toBeVisible();
  });

  test("can change answers within a step", async ({ page }) => {
    await page.goto("/");
    await selectOptionByLabel(page, "$100K+");
    await selectOptionByLabel(page, "$10K - $25K");
    await expectSelected(page, "$10K - $25K");
    await expectNotSelected(page, "$100K+");
  });
});

// ============================================================
// 8. RESULT PAGE DIRECT ACCESS — SECURITY / VALIDATION
// ============================================================

test.describe("Result Page Validation & Security", () => {
  test("no params → redirect to home", async ({ page }) => {
    await page.goto("/result");
    await page.waitForURL("/");
  });

  test("invalid score → redirect", async ({ page }) => {
    await page.goto("/result?score=abc&qualified=true&breakdown=%7B%22budget%22%3A50%7D");
    await page.waitForURL("/");
  });

  test("score > 100 → redirect", async ({ page }) => {
    await page.goto("/result?score=999&qualified=true&breakdown=%7B%22budget%22%3A50%7D");
    await page.waitForURL("/");
  });

  test("negative score → redirect", async ({ page }) => {
    await page.goto("/result?score=-10&qualified=true&breakdown=%7B%22budget%22%3A50%7D");
    await page.waitForURL("/");
  });

  test("missing qualified → redirect", async ({ page }) => {
    await page.goto("/result?score=50&breakdown=%7B%22budget%22%3A50%7D");
    await page.waitForURL("/");
  });

  test("invalid qualified → redirect", async ({ page }) => {
    await page.goto("/result?score=50&qualified=maybe&breakdown=%7B%22budget%22%3A50%7D");
    await page.waitForURL("/");
  });

  test("missing breakdown → redirect", async ({ page }) => {
    await page.goto("/result?score=50&qualified=true");
    await page.waitForURL("/");
  });

  test("malformed JSON breakdown → redirect", async ({ page }) => {
    await page.goto("/result?score=50&qualified=true&breakdown=not-json");
    await page.waitForURL("/");
  });

  test("XSS in score param → safe redirect", async ({ page }) => {
    const xss = encodeURIComponent('<script>alert("xss")</script>');
    await page.goto(`/result?score=${xss}&qualified=true&breakdown=%7B%7D`);
    await page.waitForURL("/");
  });

  test("SQL injection in params → safe redirect", async ({ page }) => {
    const sql = encodeURIComponent("'; DROP TABLE users; --");
    await page.goto(`/result?score=${sql}&qualified=true&breakdown=%7B%7D`);
    await page.waitForURL("/");
  });

  test("valid crafted URL renders correctly", async ({ page }) => {
    const breakdown = encodeURIComponent(
      JSON.stringify({
        budget: 80,
        authority: 70,
        need: 90,
        timeline: 60,
      }),
    );
    await page.goto(`/result?score=75&qualified=true&breakdown=${breakdown}`);
    await expect(page.locator(".text-5xl")).toHaveText("75");
    await expect(page.getByText(/great news/i)).toBeVisible();
  });

  test("invalid breakdown keys → redirect", async ({ page }) => {
    const breakdown = encodeURIComponent(JSON.stringify({ "INVALID KEY": 50 }));
    await page.goto(`/result?score=50&qualified=true&breakdown=${breakdown}`);
    await page.waitForURL("/");
  });

  test("breakdown values > 100 → redirect", async ({ page }) => {
    const breakdown = encodeURIComponent(JSON.stringify({ budget: 999 }));
    await page.goto(`/result?score=50&qualified=true&breakdown=${breakdown}`);
    await page.waitForURL("/");
  });

  test("negative breakdown values → redirect", async ({ page }) => {
    const breakdown = encodeURIComponent(JSON.stringify({ budget: -10 }));
    await page.goto(`/result?score=50&qualified=true&breakdown=${breakdown}`);
    await page.waitForURL("/");
  });

  test("too many breakdown keys (>10) → redirect", async ({ page }) => {
    const big: Record<string, number> = {};
    for (let i = 0; i < 11; i++) big[`key${String.fromCharCode(97 + i)}`] = 50;
    const breakdown = encodeURIComponent(JSON.stringify(big));
    await page.goto(`/result?score=50&qualified=true&breakdown=${breakdown}`);
    await page.waitForURL("/");
  });

  test("score=0 with qualified=false renders correctly", async ({ page }) => {
    const breakdown = encodeURIComponent(JSON.stringify({ budget: 0, need: 0 }));
    await page.goto(`/result?score=0&qualified=false&breakdown=${breakdown}`);
    await expect(page.locator(".text-5xl")).toHaveText("0");
    await expect(page.getByText(/thanks for your interest/i)).toBeVisible();
  });

  test("score=100 with qualified=false shows disqualified (URL can be spoofed)", async ({
    page,
  }) => {
    const breakdown = encodeURIComponent(JSON.stringify({ budget: 100 }));
    await page.goto(`/result?score=100&qualified=false&breakdown=${breakdown}`);
    // Page renders based on qualified param, not score
    await expect(page.getByText(/thanks for your interest/i)).toBeVisible();
  });
});

// ============================================================
// 9. THEME TOGGLE
// ============================================================

test.describe("Theme Toggle", () => {
  test("theme toggle button is visible", async ({ page }) => {
    await page.goto("/");
    const toggleBtn = page.locator(".absolute.top-8 button").first();
    await expect(toggleBtn).toBeVisible();
  });

  test("clicking theme toggle changes dark/light mode", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const toggleBtn = page.locator(".absolute.top-8 button").first();
    const initialClass = (await html.getAttribute("class")) || "";
    await toggleBtn.click();
    await page.waitForTimeout(300);
    const newClass = (await html.getAttribute("class")) || "";
    expect(newClass).not.toEqual(initialClass);
  });

  test("theme persists to result page", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const toggleBtn = page.locator(".absolute.top-8 button").first();
    await toggleBtn.click();
    await page.waitForTimeout(300);
    const classAfterToggle = (await html.getAttribute("class")) || "";
    await completeFormWithBestAnswers(page);
    const resultClass = (await html.getAttribute("class")) || "";
    if (classAfterToggle.includes("dark")) {
      expect(resultClass).toContain("dark");
    }
  });
});

// ============================================================
// 10. NAVIGATION EDGE CASES
// ============================================================

test.describe("Navigation Edge Cases", () => {
  test("rapid Next/Back does not break state", async ({ page }) => {
    await page.goto("/");
    await selectAllFirstOptions(page, DIMENSIONS[0].questions);
    await clickNext(page);
    await page.getByRole("button", { name: "Back" }).click();
    await clickNext(page);
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByText("Step 1 of 4")).toBeVisible();
  });

  test("browser back from result goes to form", async ({ page }) => {
    await page.goto("/");
    await completeFormWithBestAnswers(page);
    await page.goBack();
    await expect(page).toHaveURL("/");
  });

  test("refreshing result page preserves from URL params", async ({ page }) => {
    await page.goto("/");
    await completeFormWithBestAnswers(page);
    await page.reload();
    await expect(page.getByText(/great news/i)).toBeVisible();
  });

  test("double-click submit works fine", async ({ page }) => {
    await page.goto("/");
    for (let i = 0; i < DIMENSIONS.length - 1; i++) {
      await selectAllFirstOptions(page, DIMENSIONS[i].questions);
      await clickNext(page);
    }
    await selectAllFirstOptions(page, DIMENSIONS[DIMENSIONS.length - 1].questions);
    await page.getByRole("button", { name: /Submit/i }).dblclick();
    await page.waitForURL(/\/result/);
    await expect(page.locator(".text-5xl")).toBeVisible();
  });

  test("navigate forward all steps then back all steps", async ({ page }) => {
    await page.goto("/");
    for (let i = 0; i < DIMENSIONS.length - 1; i++) {
      await selectAllFirstOptions(page, DIMENSIONS[i].questions);
      await clickNext(page);
    }
    await expect(page.getByText("Step 4 of 4")).toBeVisible();
    for (let i = DIMENSIONS.length - 1; i > 0; i--) {
      await page.getByRole("button", { name: "Back" }).click();
    }
    await expect(page.getByText("Step 1 of 4")).toBeVisible();
  });
});

// ============================================================
// 11. RESPONSIVE / VIEWPORT TESTING
// ============================================================

test.describe("Responsive Design", () => {
  const viewports = [
    { name: "320px mobile", width: 320, height: 568 },
    { name: "375px iPhone", width: 375, height: 667 },
    { name: "768px tablet", width: 768, height: 1024 },
    { name: "1024px laptop", width: 1024, height: 768 },
    { name: "1440px desktop", width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    test(`no horizontal overflow at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(vp.width + 1);
    });
  }

  for (const vp of viewports) {
    test(`buttons clickable at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      const btn = page.getByRole("button", { name: "$100K+", exact: true });
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      await expectSelected(page, "$100K+");
    });
  }

  test("full form works on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await completeFormWithBestAnswers(page);
    await expect(page.getByText(/great news/i)).toBeVisible();
  });
});

// ============================================================
// 12. PERFORMANCE
// ============================================================

test.describe("Performance", () => {
  test("home page loads in under 3 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/", { waitUntil: "networkidle" });
    expect(Date.now() - start).toBeLessThan(3000);
  });

  test("step navigation under 500ms", async ({ page }) => {
    await page.goto("/");
    await selectAllFirstOptions(page, DIMENSIONS[0].questions);
    const start = Date.now();
    await clickNext(page);
    await expect(page.getByText("Step 2 of 4")).toBeVisible();
    expect(Date.now() - start).toBeLessThan(500);
  });

  test("submit to result under 2 seconds", async ({ page }) => {
    await page.goto("/");
    for (let i = 0; i < DIMENSIONS.length - 1; i++) {
      await selectAllFirstOptions(page, DIMENSIONS[i].questions);
      await clickNext(page);
    }
    await selectAllFirstOptions(page, DIMENSIONS[DIMENSIONS.length - 1].questions);
    const start = Date.now();
    await page.getByRole("button", { name: /Submit/i }).click();
    await page.waitForURL(/\/result/);
    expect(Date.now() - start).toBeLessThan(2000);
  });
});

// ============================================================
// 13. ACCESSIBILITY
// ============================================================

test.describe("Accessibility", () => {
  test("progress nav has aria-label", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: /progress/i })).toBeVisible();
  });

  test("step counter uses aria-live polite", async ({ page }) => {
    await page.goto("/");
    const live = page.locator('[aria-live="polite"]');
    await expect(live).toBeVisible();
    await expect(live).toContainText("Step 1 of 4");
  });

  test("all option buttons have readable text", async ({ page }) => {
    await page.goto("/");
    const gridButtons = page.locator(".grid button");
    const count = await gridButtons.count();
    expect(count).toBe(8);
    for (let i = 0; i < count; i++) {
      const text = await gridButtons.nth(i).textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test("keyboard Tab reaches option buttons", async ({ page }) => {
    await page.goto("/");
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      const isOptionBtn = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.tagName === "BUTTON" && el?.closest(".grid") !== null;
      });
      if (isOptionBtn) {
        await page.keyboard.press("Enter");
        const hasRing = await page.evaluate(
          () => document.activeElement?.className.includes("ring-2") ?? false,
        );
        expect(hasRing).toBe(true);
        return;
      }
    }
    // Tab never reached option button
    expect(false).toBe(true);
  });
});

// ============================================================
// 14. 404 AND UNKNOWN ROUTES
// ============================================================

test.describe("Unknown Routes", () => {
  test("/nonexistent → 404", async ({ page }) => {
    const response = await page.goto("/nonexistent");
    expect(response?.status()).toBe(404);
  });

  test("/result/something-random → 404", async ({ page }) => {
    const response = await page.goto("/result/something-random");
    expect(response?.status()).toBe(404);
  });

  test("/api/nonexistent → 404 or 405", async ({ page }) => {
    const response = await page.goto("/api/nonexistent");
    expect([404, 405]).toContain(response?.status());
  });
});

// ============================================================
// 15. CTA LINK TESTING
// ============================================================

test.describe("CTA Links", () => {
  test("qualified CTA links to /book", async ({ page }) => {
    await page.goto("/");
    await completeFormWithBestAnswers(page);
    await expect(page.getByText("Book a Strategy Call")).toHaveAttribute("href", "/book");
  });

  test("disqualified CTA links to /guide", async ({ page }) => {
    await page.goto("/");
    await completeFormWithWorstAnswers(page);
    await expect(page.getByText("Download Our Free Guide")).toHaveAttribute("href", "/guide");
  });

  test("/book page loads (200)", async ({ page }) => {
    const response = await page.goto("/book");
    expect(response?.status()).toBe(200);
  });

  test("/guide page loads (200)", async ({ page }) => {
    const response = await page.goto("/guide");
    expect(response?.status()).toBe(200);
  });
});

// ============================================================
// 16. STATE ISOLATION
// ============================================================

test.describe("State Isolation", () => {
  test("Start Over resets to step 1 with no selections", async ({ page }) => {
    await page.goto("/");
    await completeFormWithBestAnswers(page);
    await page.getByText("Start Over").click();
    await expect(page.getByText("Step 1 of 4")).toBeVisible();
    await expect(page.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
  });

  test("fresh page has no pre-selected answers", async ({ page }) => {
    await page.goto("/");
    const gridButtons = page.locator(".grid button");
    const count = await gridButtons.count();
    for (let i = 0; i < count; i++) {
      await expect(gridButtons.nth(i)).not.toHaveClass(/ring-2/);
    }
  });
});

// ============================================================
// 17. STRESS TESTING
// ============================================================

test.describe("Stress Testing", () => {
  test("rapidly clicking all options does not crash", async ({ page }) => {
    await page.goto("/");
    const gridButtons = page.locator(".grid button");
    for (let i = 0; i < 4; i++) {
      await gridButtons.nth(i).click({ delay: 0 });
    }
    await expectSelected(page, "Under $10K or unsure");
  });

  test("complete form 3 times without reload", async ({ page }) => {
    await page.goto("/");
    for (let run = 0; run < 3; run++) {
      await completeFormWithBestAnswers(page);
      await page.getByText("Start Over").click();
      await expect(page).toHaveURL("/");
    }
  });

  test("spam click disabled Next does nothing", async ({ page }) => {
    await page.goto("/");
    const nextBtn = page.getByRole("button", { name: "Next", exact: true });
    for (let i = 0; i < 5; i++) {
      await nextBtn.click({ force: true });
    }
    await expect(page.getByText("Step 1 of 4")).toBeVisible();
  });
});

// ============================================================
// 18. SCORE DISPLAY ACCURACY
// ============================================================

test.describe("Score Display", () => {
  test("perfect score displays 100", async ({ page }) => {
    await page.goto("/");
    await completeFormWithBestAnswers(page);
    await expect(page.locator(".text-5xl")).toHaveText("100");
  });

  test("breakdown shows percentage labels", async ({ page }) => {
    await page.goto("/");
    await completeFormWithBestAnswers(page);
    await expect(page.getByText("100%").first()).toBeVisible();
  });

  test("circular SVG progress indicator present", async ({ page }) => {
    await page.goto("/");
    await completeFormWithBestAnswers(page);
    const circles = page.locator("svg circle");
    expect(await circles.count()).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================
// 19. FOOTER & MISC UI
// ============================================================

test.describe("Footer & Misc UI", () => {
  test("result page shows contact footer", async ({ page }) => {
    await page.goto("/");
    await completeFormWithBestAnswers(page);
    await expect(page.getByText(/reach out to our team/i)).toBeVisible();
  });

  test("home page shows step completion counter", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("1 of 4 steps completed")).toBeVisible();
  });
});
