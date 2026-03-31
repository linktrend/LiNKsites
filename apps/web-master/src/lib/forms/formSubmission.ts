import { FormSubmissionPayload, FormSubmissionResponse } from "../contactTypes";

/**
 * Form submission utilities
 */

export interface SubmitFormOptions {
  endpoint: string;
  method?: string;
  intentTag?: string;
  lang?: string;
}

/**
 * Submit form data to API endpoint
 */
export async function submitForm(
  data: Record<string, any>,
  options: SubmitFormOptions
): Promise<FormSubmissionResponse> {
  const { endpoint, method = "POST", intentTag = "general", lang = "en" } = options;

  const payload: FormSubmissionPayload = {
    intentTag,
    formData: data,
    metadata: {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      language: lang,
    },
  };

  const response = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result: FormSubmissionResponse = await response.json();

  if (!response.ok) {
    throw new Error(result.error || result.message || "Failed to submit form");
  }

  return result;
}

/**
 * Handle form submission with error handling
 */
export async function handleFormSubmission(
  data: Record<string, any>,
  options: SubmitFormOptions,
  callbacks?: {
    onSuccess?: (result: FormSubmissionResponse) => void;
    onError?: (error: Error) => void;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await submitForm(data, options);
    
    if (result.success) {
      callbacks?.onSuccess?.(result);
      return { success: true };
    } else {
      const errorMessage = result.error || result.message || "Failed to submit form";
      callbacks?.onError?.(new Error(errorMessage));
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Network error. Please try again.";
    callbacks?.onError?.(error instanceof Error ? error : new Error(errorMessage));
    return { success: false, error: errorMessage };
  }
}


