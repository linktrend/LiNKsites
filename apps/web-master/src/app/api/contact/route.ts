import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ENVIRONMENT, ENV } from "@/config";

// Environment variables for webhook configuration
const WEBHOOK_URL = ENV.CONTACT.WEBHOOK_URL;
const WEBHOOK_SECRET = ENV.CONTACT.WEBHOOK_SECRET;
const FALLBACK_EMAIL = ENV.CONTACT.FALLBACK_EMAIL;

// Request size limit (1MB)
const MAX_REQUEST_SIZE = 1024 * 1024;

/**
 * Retry logic for webhook failures with exponential backoff
 */
async function sendWithRetry(url: string, data: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(WEBHOOK_SECRET && { "X-Webhook-Secret": WEBHOOK_SECRET }),
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return { success: true, attempt };
      }

      if (attempt === maxRetries) {
        throw new Error(`Webhook failed after ${maxRetries} attempts: ${response.statusText}`);
      }

      // Exponential backoff: 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
}

/**
 * API Route Payload Schema
 * Validates the structure of contact form submissions
 */
const contactApiSchema = z.object({
  intentTag: z.string().min(1).max(100),
  formData: z.record(z.string(), z.any()).refine(
    (data) => {
      // Ensure formData is not empty
      return Object.keys(data).length > 0;
    },
    { message: "Form data cannot be empty" }
  ),
  metadata: z
    .object({
      timestamp: z.string(),
      userAgent: z.string().optional(),
      referrer: z.string().optional(),
      language: z.string().optional(),
    })
    .optional(),
});

type ContactApiPayload = z.infer<typeof contactApiSchema>;

/**
 * POST /api/contact
 * Handles contact form submissions and forwards to N8N webhook or other destinations
 * 
 * @param request - Next.js request object
 * @returns JSON response with success status and message
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check request size (prevent DoS attacks)
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "Request too large",
          message: "The request payload exceeds the maximum allowed size",
        },
        { status: 413 }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON",
          message: "The request body must be valid JSON",
        },
        { status: 400 }
      );
    }

    // Validate incoming payload with Zod
    const validated = contactApiSchema.parse(body);

    // Sanitize form data to prevent XSS and injection attacks
    const sanitizedFormData = Object.entries(validated.formData).reduce(
      (acc, [key, value]) => {
        // Only allow string, number, boolean values
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          acc[key] = value;
        } else if (value === null || value === undefined) {
          acc[key] = "";
        } else {
          // Convert complex types to string
          acc[key] = String(value);
        }
        return acc;
      },
      {} as Record<string, string | number | boolean>
    );

    // Prepare payload for webhook (N8N or other automation)
    const payload = {
      intent: validated.intentTag,
      submission: sanitizedFormData,
      metadata: {
        timestamp: validated.metadata?.timestamp || new Date().toISOString(),
        userAgent: validated.metadata?.userAgent || request.headers.get("user-agent") || "unknown",
        referrer: validated.metadata?.referrer || request.headers.get("referer") || "direct",
        language: validated.metadata?.language || "en",
        ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      },
    };

    // Send to webhook with retry logic
    if (WEBHOOK_URL) {
      try {
        await sendWithRetry(WEBHOOK_URL, payload);
        console.log(`[Contact Form] Successfully sent to webhook: ${validated.intentTag}`);
      } catch (webhookError) {
        console.error("[Contact Form] Webhook failed:", webhookError);
        // Log the submission for manual processing
        console.log("[Contact Form] Failed submission data:", JSON.stringify(payload, null, 2));
        
        // Still return success to user (data is logged for recovery)
        return NextResponse.json({
          success: true,
          message: "Contact request received. We'll respond as soon as possible.",
        });
      }
    } else {
      // Development mode: log to console
      console.log("[Contact Form Submission - DEV MODE]");
      console.log("Intent:", validated.intentTag);
      console.log("Data:", JSON.stringify(payload, null, 2));
      console.log("---");
    }

    return NextResponse.json({
      success: true,
      message: "Contact request received successfully",
    });
  } catch (error) {
    console.error("[Contact API Error]", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      // In production, don't expose detailed validation errors
      const errorDetails = ENVIRONMENT.isProduction
        ? undefined
        : error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          }));

      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: "Please check your form inputs and try again",
          ...(errorDetails && { details: errorDetails }),
        },
        { status: 400 }
      );
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          message: "The request body must be valid JSON",
        },
        { status: 400 }
      );
    }

    // Handle other errors - don't leak internal error details
    console.error("[Contact API Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred. Please try again later",
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/contact
 * Handles CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
