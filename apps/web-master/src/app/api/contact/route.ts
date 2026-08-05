import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ENVIRONMENT } from "@/config";
import { FileOutbox, LiNKautoworkGateway, parseGatewayEventPolicies, type GatewayEnvironment } from "@linksites/autowork-boundary";

// Request size limit (1MB)
const MAX_REQUEST_SIZE = 1024 * 1024;

const enqueueContact = async (payload: { intent: string; submission: Record<string, string | number | boolean>; metadata: Record<string, string> }) => {
  const url = process.env.LINKAUTOWORK_GATEWAY_URL;
  const secret = process.env.LINKAUTOWORK_SIGNING_SECRET;
  const keyId = process.env.LINKAUTOWORK_SIGNING_KEY_ID;
  const environment = process.env.LINKAUTOWORK_ENVIRONMENT as GatewayEnvironment;
  const orgId = process.env.LINKSITES_ORG_ID;
  const siteId = process.env.LINKSITES_SITE_ID;
  const outboxPath = process.env.LINKAUTOWORK_OUTBOX_PATH;
  const integritySecret = process.env.LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET;
  const grants = process.env.LINKAUTOWORK_EVENT_GRANTS;
  if (!url || !secret || !keyId || !environment || !orgId || !siteId || !outboxPath || !integritySecret || !grants) throw new Error('governed LiNKautowork contact configuration is incomplete');
  const gateway = new LiNKautoworkGateway({ secret, keyId, environment, policies: parseGatewayEventPolicies(grants), transport: async (request) => {
    const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request) });
    const acknowledgedAt = response.headers.get('x-linkautowork-acknowledged-at') ?? new Date().toISOString();
    return { status: response.status, receiptId: response.headers.get('x-linkautowork-receipt') ?? 'missing', receiptSignature: response.headers.get('x-linkautowork-receipt-signature') ?? 'missing', acknowledgedAt };
  }});
  const outbox = new FileOutbox(outboxPath, { maxAttempts: 5, metrics: gateway.metrics, integritySecret, resigner: (request, attempt) => gateway.resignRequest(request, attempt), validator: (request) => gateway.verifyStored(request) });
  await outbox.enqueue(gateway.buildRequest('contact.submitted', orgId, `web:${siteId}`, `contact:${siteId}:${payload.metadata.timestamp}:${payload.intent}`, { lead_id: `contact:${siteId}`, site_id: siteId, submission: payload.submission }));
};

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
 * Handles contact form submissions and appends them to the shared governed outbox.
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

    // Prepare the vendor-neutral governed event payload.
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

    await enqueueContact(payload);

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
