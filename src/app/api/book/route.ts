import { NextRequest, NextResponse } from "next/server";
import { isValidBookingData, sanitizeString } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

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
    if (!isValidBookingData(body)) {
      return NextResponse.json({ error: "Invalid booking data" }, { status: 400 });
    }

    // Sanitize inputs
    const bookingData = {
      name: sanitizeString(body.name, 255),
      email: sanitizeString(body.email, 255),
      company: sanitizeString(body.company, 255),
      phone: body.phone ? sanitizeString(body.phone, 20) : undefined,
      preferredTime: body.preferredTime,
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
            type: "booking",
            ...bookingData,
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
      console.warn("[BOOKING] Received booking submission (no webhook configured)");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking request received. We'll contact you soon!",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing booking request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
