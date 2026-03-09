import { NextRequest, NextResponse } from "next/server";
import { isValidGuideData, sanitizeString } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const clientIp = getClientIp(request);
    const { success: rateLimitSuccess } = rateLimit(clientIp);

    if (!rateLimitSuccess) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Validate data
    if (!isValidGuideData(body)) {
      return NextResponse.json({ error: "Invalid guide signup data" }, { status: 400 });
    }

    // Sanitize inputs
    const signupData = {
      name: sanitizeString(body.name, 255),
      email: sanitizeString(body.email, 255),
      company: body.company ? sanitizeString(body.company, 255) : undefined,
      submittedAt: new Date().toISOString(),
    };

    // Send to webhook if configured
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "guide_signup",
            ...signupData,
          }),
        });

        if (!webhookResponse.ok) {
          console.error(`Webhook request failed with status ${webhookResponse.status}`);
        }
      } catch (error) {
        console.error("Failed to send webhook:", error);
        // Don't fail the request if webhook fails
      }
    } else {
      // Log to console if no webhook configured
      console.warn("[GUIDE_SIGNUP] Received guide signup (no webhook configured)");
    }

    // Attempt to read and return PDF
    try {
      const pdfPath = path.join(process.cwd(), "public", "sales-qualification-playbook.pdf");
      const pdfBuffer = await fs.readFile(pdfPath);

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="sales-qualification-playbook.pdf"',
        },
      });
    } catch (error) {
      console.error("Failed to read PDF:", error);
      // Return JSON response if PDF not found
      return NextResponse.json(
        {
          success: true,
          message: "Signup received! We're preparing your guide.",
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Error processing guide signup:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
