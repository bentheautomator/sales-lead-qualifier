# Sales Lead Qualifier - User Guide

Welcome to the Sales Lead Qualifier. This tool helps you quickly determine whether a prospect is a good fit for your services using the proven BANT framework (Budget, Authority, Need, Timeline). This guide explains every feature and how to use it.

---

## What is the Sales Lead Qualifier?

The Sales Lead Qualifier is an online questionnaire that scores prospects across four dimensions:

| Dimension     | What It Measures                                                           | Weight |
| ------------- | -------------------------------------------------------------------------- | ------ |
| **Budget**    | Can the prospect afford your solution? Is funding approved?                | 30%    |
| **Authority** | Is the prospect the decision maker? How complex is their approval process? | 25%    |
| **Need**      | How urgent and critical are their pain points?                             | 30%    |
| **Timeline**  | How soon do they plan to implement a solution?                             | 15%    |

A prospect who scores **70 or above** out of 100 is considered a **strong fit**. Below 70, the tool recommends nurturing the lead with educational resources instead.

---

## How to Use the Qualifier

### Step 1: Open the Tool

Visit the main page of the Sales Lead Qualifier. You will see a welcome screen with a progress bar showing four steps: Budget, Authority, Need, and Timeline.

### Step 2: Answer the Questions

Each step presents one or two questions with four answer choices. Click the answer that best describes your prospect's situation.

**Budget questions ask about:**

- Annual budget range for the type of solution you offer
- Whether budget has already been approved

**Authority questions ask about:**

- The prospect's role in the purchasing decision
- How formal their buying process is

**Need questions ask about:**

- How critical their current pain points are
- How urgently they need to solve the problem

**Timeline questions ask about:**

- When they plan to implement a solution

### Step 3: Navigate Between Steps

- Click **Next** to move to the next dimension (button activates only after all questions in the current step are answered)
- Click **Back** to return to a previous step and change answers
- On the final step, click **Submit** to see your results

### Step 4: View Your Results

After submitting, you will see a results page showing:

- **Your overall score** displayed in a circular progress indicator (out of 100)
- **A qualification verdict** - either "Great news - you're a strong fit!" (70+) or "Thanks for your interest" (below 70)
- **A BANT breakdown** showing your score for each individual dimension as a progress bar
- **A recommended next step** based on the result

---

## What Happens After the Quiz

### If the Prospect Qualifies (Score 70+)

The results page displays a green-themed success message with a sparkle celebration effect. A **"Book a Strategy Call"** button appears, linking to the booking page.

### If the Prospect Does Not Qualify (Score Below 70)

The results page displays an amber-themed informational message. A **"Download Our Free Guide"** button appears, linking to the free guide download page.

---

## Booking a Strategy Call

The booking page (`/book`) is available to qualified prospects. Here is how it works:

1. Fill in the required fields:
   - **Full Name** (required)
   - **Email Address** (required)
   - **Company Name** (required)
   - **Phone Number** (optional)
   - **Preferred Meeting Time** - choose Morning (9 AM-12 PM), Afternoon (12 PM-5 PM), or Evening (5 PM-8 PM)

2. Click **"Schedule Strategy Call"**

3. After submission, you will see a confirmation screen showing:
   - Your name and the time slot you selected
   - A message that the team will contact you within 24 hours
   - A three-step "What happens next" checklist

4. A **"Run Qualifier Again"** button lets you return to the main tool

---

## Downloading the Free Guide

The guide page (`/guide`) offers a free PDF download called "The Sales Qualification Playbook." Here is how it works:

1. Fill in the required fields:
   - **Full Name** (required)
   - **Email Address** (required)
   - **Company** (optional)

2. Click **"Download Free Guide"**

3. The PDF will automatically download to your computer. After submission, you will see a confirmation screen showing:
   - Your name and a thank-you message
   - A **"Download PDF Again"** button in case the automatic download did not start
   - A summary of what is inside the guide (BANT framework deep dive, real qualification questions, common mistakes, repeatable process)

4. A **"Try the Qualifier"** button lets you return to the main tool

### What is in the Guide?

The Sales Qualification Playbook is an 8-section PDF covering:

- Introduction to why qualification matters
- The BANT Framework explained (Budget, Authority, Need, Timeline)
- Identifying your Ideal Customer Profile
- Qualification questions that actually work (with real conversation scripts)
- Common qualification mistakes to avoid
- Building a repeatable qualification process
- Practical next steps to implement immediately

---

## Embeddable Version

A standalone HTML version of the qualifier is available at `/embed.html`. This version:

- Works without any external dependencies (no frameworks or libraries needed)
- Can be embedded on any website using an iframe:

```html
<iframe src="https://yourdomain.com/embed.html" width="100%" height="700" frameborder="0"></iframe>
```

- Can be copy-pasted into platforms like GoHighLevel, ClickFunnels, or any tool that accepts custom HTML
- Contains the same BANT questions, scoring logic, and result display as the main application
- Includes a "Start Over" button to retake the quiz

**Note:** The CTA buttons in the embed version link to `/book` and `/guide` on the main site. If you are hosting the embed on a different domain, update those URLs to point to the full address of your main site.

---

## Dark Mode

The tool supports both light and dark color themes. A toggle button appears in the top-right corner of every page (displayed as a sun or moon icon). Click it to switch between light and dark mode. Your preference is remembered while you browse.

---

## Glitter Effect

A floating glitter animation plays across the background on all pages. This is a visual enhancement that some users may want to turn off for a cleaner look or for performance on older devices.

**To disable the glitter effect:**

1. Open the `.env.local` file in your project root (create it if it does not exist)
2. Add this line:
   ```
   NEXT_PUBLIC_ENABLE_GLITTER=false
   ```
3. Restart the application (or redeploy)

Setting the value back to `true` (or removing the line) re-enables the effect.

**Note:** The one-time sparkle celebration that plays when a prospect qualifies on the results page is separate and always plays regardless of this setting.

---

## What Works Out of the Box vs. What Needs Setup

This section explains which features work immediately after deployment and which require additional configuration.

### Works Immediately (No Setup Needed)

| Feature                | Description                                                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **BANT Quiz**          | The entire qualification questionnaire, scoring, and results work with zero configuration.                                                      |
| **PDF Download**       | The Sales Qualification Playbook PDF is pre-built and included with the application. It downloads instantly when a user submits the guide form. |
| **Dark Mode**          | The light/dark theme toggle works on every page out of the box.                                                                                 |
| **Visual Effects**     | Glitter background, sparkle celebration, and animated gradients all work immediately (and can be toggled off via env var).                      |
| **Rate Limiting**      | API endpoints are protected at 20 requests per hour per IP address. No setup required.                                                          |
| **Security Headers**   | Content Security Policy, clickjacking protection, and other security headers are pre-configured.                                                |
| **Embeddable Version** | The standalone HTML file at `/embed.html` works as-is for iframes or copy-paste embedding.                                                      |
| **Score Verification** | Quiz scores are cryptographically signed to prevent tampering. Works automatically.                                                             |

### Requires Your Setup (Expansion Points)

These features have the plumbing in place but need you to connect them to your own services:

| Feature                    | What to Set Up                                                                                                                                                                                                                                                                                                                         | How                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Webhook (Lead Capture)** | Without a webhook URL, form submissions from the booking and guide pages succeed for the user but the data is only logged to the server console. To capture leads in your CRM, set `WEBHOOK_URL` in `.env.local` to your webhook endpoint (n8n, Zapier, GoHighLevel, Make, or any URL that accepts POST requests).                     | `WEBHOOK_URL=https://your-endpoint.com/lead` |
| **Email Notifications**    | The application does not send emails. There is no email service built in. If you want to send confirmation emails or deliver the PDF via email, you will need to add that through your webhook automation (for example, an n8n workflow that receives the webhook and triggers an email via SendGrid, Resend, or your email provider). | Connect via your webhook automation tool     |
| **Calendar Invites**       | The booking confirmation tells users the team will send a calendar invite. This is not automated. You will need to handle calendar invite creation through your CRM or webhook automation after receiving the booking submission.                                                                                                      | Connect via your webhook automation tool     |

### How the Webhook Works

When a user submits either form, the application sends a JSON POST request to your `WEBHOOK_URL` with this data:

**Guide form submissions:**

```json
{
  "type": "guide_signup",
  "name": "Jane Doe",
  "email": "jane@company.com",
  "company": "Acme Corp",
  "submittedAt": "2026-03-08T14:30:00.000Z"
}
```

**Booking form submissions:**

```json
{
  "type": "booking",
  "name": "Jane Doe",
  "email": "jane@company.com",
  "company": "Acme Corp",
  "phone": "+1 555-123-4567",
  "preferredTime": "morning",
  "submittedAt": "2026-03-08T14:30:00.000Z"
}
```

If the webhook URL is not set or the webhook call fails, the user's submission still succeeds. No data is lost from the user's perspective, but you will not receive the lead data unless you have the webhook configured.

---

## Environment Variables Reference

All configuration is done through environment variables in a `.env.local` file. A template is provided in `.env.example`.

| Variable                     | Required | Default | Description                                                      |
| ---------------------------- | -------- | ------- | ---------------------------------------------------------------- |
| `WEBHOOK_URL`                | No       | Not set | URL to receive form submissions as JSON POST requests            |
| `NEXT_PUBLIC_ENABLE_GLITTER` | No       | `true`  | Set to `false` to disable the floating glitter background effect |

---

## Frequently Asked Questions

**Can I change the qualifying score threshold?**
Yes. The threshold (currently 70 out of 100) is set in a single configuration file. Your administrator can adjust it without changing any other code.

**Can I change the questions or answer options?**
Yes. All questions, answer labels, and point values are defined in a single configuration file. Changes take effect after redeployment.

**Can I change the BANT dimension weights?**
Yes. The weights (currently Budget 30%, Authority 25%, Need 30%, Timeline 15%) are configurable. They must add up to 100%.

**Is my data stored anywhere?**
The application does not store quiz answers in a database. Scoring happens in real time and results are delivered via a secure session cookie. Form submissions on the booking and guide pages are forwarded to your webhook endpoint if one is configured. Otherwise, they are only logged to the server console.

**Will I lose leads if I do not set up the webhook?**
Users will see a success message after submitting a form, but you will not receive their information anywhere persistent. Set up `WEBHOOK_URL` before going live to avoid losing leads.

**Is there a limit on how many times I can use it?**
API endpoints are rate-limited to 20 requests per hour per IP address to prevent abuse. Normal usage will not hit this limit.

**Does the tool work on mobile devices?**
Yes. The interface is fully responsive and works on phones, tablets, and desktop browsers.

**Do I need to create an account?**
No. There is no login or account creation required. The tool works immediately.

**How do I turn off the glitter?**
Add `NEXT_PUBLIC_ENABLE_GLITTER=false` to your `.env.local` file and restart the application.

---

## Pages at a Glance

| Page        | URL           | Purpose                                               |
| ----------- | ------------- | ----------------------------------------------------- |
| Qualifier   | `/`           | The main BANT quiz                                    |
| Results     | `/result`     | Score and breakdown after completing the quiz         |
| Book a Call | `/book`       | Strategy call booking form (for qualified prospects)  |
| Free Guide  | `/guide`      | PDF download form (for all prospects)                 |
| Embed       | `/embed.html` | Standalone version for iframes and external platforms |
