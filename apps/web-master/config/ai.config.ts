import { z } from "zod";
import { ENV } from "./env.config";
import { getSiteUrl } from "./site.config";

export const AI_ACTIONS_VERSION = "1.0.0";

const ActionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  url: z.string().url(),
  auth: z.object({
    required: z.boolean(),
    header: z.string().optional(),
  }),
  rateLimitPerMinute: z.number().int().positive().optional(),
  stateChanging: z.boolean(),
  inputSchema: z.record(z.string(), z.any()).optional(),
  outputSchema: z.record(z.string(), z.any()).optional(),
});

const ActionSetSchema = z.object({
  version: z.string(),
  generatedAt: z.string(),
  actions: z.array(ActionSchema),
});

export type AiAction = z.infer<typeof ActionSchema>;
export type AiActionSet = z.infer<typeof ActionSetSchema>;

const baseUrl = getSiteUrl();

const ACTIONS: AiAction[] = [
  {
    id: "contact_submit",
    name: "Submit Contact Request",
    description: "Create a contact request for a consultation or inquiry.",
    method: "POST",
    url: `${baseUrl}/api/ai-actions/contact`,
    auth: {
      required: true,
      header: "X-AI-Action-Token",
    },
    rateLimitPerMinute: ENV.AI.ACTIONS_RATE_LIMIT_PER_MIN,
    stateChanging: true,
    inputSchema: {
      intentTag: "string",
      formData: "object",
      metadata: "object",
    },
    outputSchema: {
      success: "boolean",
      message: "string",
    },
  },
  {
    id: "search_resources",
    name: "Search Resources",
    description: "Search public resource content by keyword.",
    method: "GET",
    url: `${baseUrl}/resources`,
    auth: {
      required: false,
    },
    stateChanging: false,
  },
];

export const getAiActions = (): AiActionSet => {
  const payload: AiActionSet = {
    version: AI_ACTIONS_VERSION,
    generatedAt: new Date().toISOString(),
    actions: ACTIONS,
  };
  return ActionSetSchema.parse(payload);
};

export const AI_FEATURES = {
  enableMarkdownViews: ENV.AI.ENABLE_MARKDOWN,
  enableTrainingSignal: ENV.AI.ENABLE_TRAINING_SIGNAL,
} as const;

export default {
  AI_ACTIONS_VERSION,
  AI_FEATURES,
  getAiActions,
} as const;
