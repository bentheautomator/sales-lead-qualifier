import PDFDocument from "pdfkit";
import { createWriteStream } from "fs";
import { mkdirSync } from "fs";
import path from "path";

const outputDir = path.join(process.cwd(), "public");
const outputPath = path.join(outputDir, "sales-qualification-playbook.pdf");

// Ensure public directory exists
try {
  mkdirSync(outputDir, { recursive: true });
} catch (_error) {
  // Directory already exists
}

const doc = new PDFDocument({
  size: "A4",
  margin: 50,
  bufferPages: true,
});

const stream = createWriteStream(outputPath);
doc.pipe(stream);

// Helper function for section headings
function sectionHeading(text: string) {
  doc.fontSize(18).font("Helvetica-Bold").text(text, { color: "#1e40af" });
  doc.moveDown(0.5);
}

// Helper function for body text
function bodyText(text: string, options: any = {}) {
  doc
    .fontSize(11)
    .font("Helvetica")
    .text(text, {
      color: "#374151",
      align: "left",
      ...options,
    });
  doc.moveDown(0.5);
}

// Helper function for subheadings
function subHeading(text: string) {
  doc.fontSize(14).font("Helvetica-Bold").text(text, { color: "#374151" });
  doc.moveDown(0.3);
}

// PAGE 1: Cover Page
doc.fontSize(32).font("Helvetica-Bold").text("The Sales Qualification Playbook", {
  color: "#1e40af",
  align: "center",
});
doc.moveDown(1);

doc.fontSize(16).font("Helvetica").text("A Practical Guide to Closing More Deals", {
  color: "#6b7280",
  align: "center",
});
doc.moveDown(3);

doc.fontSize(12).font("Helvetica").text("By the Sales Lead Qualifier Team", {
  color: "#9ca3af",
  align: "center",
});
doc.moveDown(2);

doc
  .fontSize(11)
  .font("Helvetica")
  .text(
    "Master the BANT framework and learn proven qualification techniques that separate genuine opportunities from time-wasting prospects. This guide contains real-world scripts, conversation starters, and a step-by-step qualification process you can implement immediately.",
    {
      color: "#374151",
      align: "center",
      width: 400,
    },
  );

doc.addPage();

// PAGE 2: Introduction
sectionHeading("Introduction");
bodyText(
  "The biggest cost in sales isn't the tools, the team, or the territory. It's lost time chasing prospects who were never going to buy.",
);
bodyText(
  "Every hour you spend with a prospect who lacks budget, decision authority, real urgency, or a reasonable timeline is an hour stolen from a genuinely qualified opportunity. Top sales teams understand this. They qualify ruthlessly — not to be cruel, but to focus their finite time and energy on deals they can actually win.",
);
bodyText(
  "The challenge isn't that qualification is complicated. It's that most salespeople don't have a repeatable system. They rely on gut feel, vague conversations, and wishful thinking. They hope a prospect will become qualified instead of systematically evaluating whether they actually are.",
);
bodyText(
  "This playbook gives you that system. It's based on the BANT framework — a battle-tested qualification model used by the world's most disciplined sales organizations. BANT stands for Budget, Authority, Need, and Timeline. When you know how to expertly evaluate each of these dimensions, you'll be able to predict deal success with remarkable accuracy.",
);

doc.addPage();

// PAGE 3: The BANT Framework Explained
sectionHeading("The BANT Framework Explained");
bodyText(
  "BANT is a qualification methodology that helps you evaluate whether a prospect has the fundamental conditions necessary to buy. Let's break down each dimension:",
);
doc.moveDown(0.5);

subHeading("1. Budget");
bodyText(
  "Can they afford the solution? This isn't about the price tag — it's about whether they have allocated budget for this type of initiative. A prospect might be interested but haven't reserved funds. Without budget, even the best pitch goes nowhere. Your goal: Understand their budget range and confirm that funds are either approved or likely to be approved.",
);

subHeading("2. Authority");
bodyText(
  "Can they make the decision? You might be talking to a champion, but if they can't actually approve the purchase, you're not having a decision-maker conversation. Different organizations have different approval chains. Some empower individuals; others require committees. Identify who holds the actual authority, and make sure you're building relationships at the right level.",
);

subHeading("3. Need");
bodyText(
  "Do they have a real problem that your solution solves? Need is where emotional buy-in happens. A prospect with severe pain points that keep them up at night will move mountains to solve those problems. A prospect with vague dissatisfaction will put the decision on the backburner indefinitely. The more specific and critical their need, the higher your qualification score.",
);

subHeading("4. Timeline");
bodyText(
  "When do they plan to implement a solution? Timeline reveals urgency. A prospect who needs to solve their problem within 30 days is fundamentally different from one exploring options 'sometime next year.' Realistic, near-term timelines indicate serious intent and intent to move forward.",
);

doc.addPage();

// PAGE 4: Identifying Your Ideal Customer Profile
sectionHeading("Identifying Your Ideal Customer Profile");
bodyText(
  "Before you can qualify effectively, you need to know what a 'qualified' prospect looks like for your business. This is your Ideal Customer Profile (ICP). Every company's ICP is different.",
);
doc.moveDown(0.5);

bodyText(
  "To build yours, look at your best customers and reverse-engineer their common characteristics. Do they tend to be in specific industries? What size are they? How much do they spend? What problems do they have in common? What objections did they NOT have?",
);
doc.moveDown(0.5);

bodyText(
  "Once you know your ICP, apply BANT ruthlessly. A prospect might seem like an ideal fit demographically but fail the Budget check. That's fine — that's the point. BANT helps you quickly identify misalignment before investing significant time.",
);
doc.moveDown(0.5);

bodyText(
  "Consider creating a qualification scorecard specific to your business. Weight each BANT dimension based on what matters most to your sales cycle. If budget is rarely an issue in your market but timeline kills deals, weight Timeline more heavily. Customize BANT to your reality.",
);

doc.addPage();

// PAGE 5: Qualification Questions That Actually Work
sectionHeading("Qualification Questions That Actually Work");
bodyText(
  "The key to effective qualification is asking the right questions in a way that feels natural. Here are proven conversation starters organized by BANT dimension:",
);
doc.moveDown(0.5);

subHeading("Budget Questions");
bodyText(
  "• 'Is there budget already allocated for this initiative, or would we need to discuss securing it?'",
);
bodyText(
  "• 'What's the typical budget range for solutions in this category? (This isn't a commitment — just helps me understand what we're working with.)'",
);
bodyText("• 'Who owns the budget for this type of project?'");
doc.moveDown(0.5);

subHeading("Authority Questions");
bodyText("• 'Walk me through your decision-making process. Who needs to be involved?'");
bodyText(
  "• 'Is there a formal buying committee, or do decisions typically go through one or two key people?'",
);
bodyText("• 'If you decided to move forward today, what would that approval process look like?'");
doc.moveDown(0.5);

subHeading("Need Questions");
bodyText("• 'What's the impact on your business if this problem isn't solved?'");
bodyText("• 'How is this affecting your team's productivity or efficiency right now?'");
bodyText("• 'What have you already tried to address this?'");
doc.moveDown(0.5);

subHeading("Timeline Questions");
bodyText("• 'When do you envision implementing a solution? What's driving that timeline?'");
bodyText("• 'Is this a priority for Q1, or are you still in the exploration phase?'");
bodyText("• 'What would cause you to accelerate this decision?'");

doc.addPage();

// PAGE 6: Common Qualification Mistakes
sectionHeading("Common Qualification Mistakes");
bodyText("Even experienced salespeople fall into these traps. Avoid them:");
doc.moveDown(0.5);

subHeading("1. Talking Too Much");
bodyText(
  "The worst mistake is pitching before you qualify. Excited salespeople often jump into their solution story before they understand the prospect's situation. Ask questions. Listen. Qualify first. Pitch later.",
);
doc.moveDown(0.5);

subHeading("2. Taking 'No' for 'Not Now'");
bodyText(
  "A prospect without budget or timeline isn't qualified. Don't convince yourself they'll magically become qualified by moving forward. They either have budget or they don't. They either have urgency or they don't. Move on, or explicitly agree to reconnect when circumstances change.",
);
doc.moveDown(0.5);

subHeading("3. Assuming Confirmation");
bodyText(
  "A prospect who smiles and seems interested isn't necessarily qualified. Get explicit confirmations. 'So you have $50K allocated for this?' Not 'Does budget exist for this type of thing somewhere?' Specific. Direct. Confirmable.",
);
doc.moveDown(0.5);

subHeading("4. Ignoring Red Flags");
bodyText(
  "They can't identify the decision maker. Their timeline keeps getting pushed. They won't commit to a budget. These aren't minor issues — they're disqualifiers. Walk away gracefully and focus your energy elsewhere.",
);

doc.addPage();

// PAGE 7: Building a Repeatable Process
sectionHeading("Building a Repeatable Process");
bodyText(
  "Qualification only works if it becomes habitual. Here's how to embed it into your sales process:",
);
doc.moveDown(0.5);

subHeading("Step 1: Qualify in Every Call");
bodyText(
  "Make qualification a standard part of every discovery call, not a one-time event. Early in the conversation, establish the prospect's position on each BANT dimension. Document it.",
);
doc.moveDown(0.5);

subHeading("Step 2: Score Objectively");
bodyText(
  "Don't let emotion cloud your judgment. If they lack budget, note it. If timeline is unclear, flag it. Use a consistent scoring system so qualification is repeatable, not subjective.",
);
doc.moveDown(0.5);

subHeading("Step 3: Make Go/No-Go Decisions");
bodyText(
  "Once you have enough information, make a conscious decision: Is this a qualified opportunity? If yes, move it forward with urgency. If no, move on or set a explicit follow-up trigger.",
);
doc.moveDown(0.5);

subHeading("Step 4: Track Your Accuracy");
bodyText(
  "Over time, track which deals you qualified as strong actually closed, and which qualified deals stalled. Use that data to calibrate your qualification thresholds. You'll get better at predicting success.",
);

doc.addPage();

// PAGE 8: Next Steps
sectionHeading("Next Steps");
bodyText(
  "You now have a framework and scripts to qualify more effectively. The final step is implementation.",
);
doc.moveDown(1);

bodyText(
  "1. Review your last 10 deals. Score them retroactively using BANT. Which ones had strong qualification? Which ones were weak?",
);
doc.moveDown(0.5);

bodyText(
  "2. Identify your top 3 prospecting sources. Starting Monday, apply rigorous BANT qualification to every new prospect from those sources.",
);
doc.moveDown(0.5);

bodyText(
  "3. Build a simple scorecard. Assign points for each BANT dimension. Define what 'qualified' looks like for your business.",
);
doc.moveDown(0.5);

bodyText(
  "4. Share this playbook with your team. Make qualification a cultural value, not just a process. Celebrate salespeople who qualify ruthlessly.",
);
doc.moveDown(1.5);

doc.fontSize(12).font("Helvetica-Bold").text("Ready to get serious about qualification?", {
  color: "#1e40af",
});

bodyText(
  "Use the Sales Lead Qualifier tool to systematically evaluate your prospects against these dimensions. In minutes, you'll know exactly where a prospect stands and whether the opportunity is worth your time.",
);
doc.moveDown(1);

doc.fontSize(10).font("Helvetica").text("Created by the Sales Lead Qualifier Team", {
  color: "#9ca3af",
  align: "center",
});

doc.end();

stream.on("finish", () => {
  console.warn(`✓ PDF generated successfully at ${outputPath}`);
  process.exit(0);
});

stream.on("error", (error) => {
  console.error("Error generating PDF:", error);
  process.exit(1);
});
