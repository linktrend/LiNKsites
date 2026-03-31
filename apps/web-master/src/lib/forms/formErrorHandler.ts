/**
 * Form error handling utilities
 */

export interface FormError {
  field?: string;
  message: string;
  code?: string;
}

/**
 * Parse API error response
 */
export function parseApiError(error: any): FormError {
  if (error?.response?.data?.message) {
    return {
      message: error.response.data.message,
      code: error.response.data.code,
    };
  }

  if (error?.message) {
    return {
      message: error.message,
    };
  }

  return {
    message: "An unexpected error occurred. Please try again.",
  };
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: any, t?: (key: string) => string): string {
  const parsedError = parseApiError(error);
  
  // If translation function is provided, try to translate the error
  if (t && parsedError.code) {
    const translatedMessage = t(`forms.errors.${parsedError.code}`);
    if (translatedMessage !== `forms.errors.${parsedError.code}`) {
      return translatedMessage;
    }
  }

  return parsedError.message;
}

/**
 * Log form error for debugging
 */
export function logFormError(formName: string, error: any): void {
  console.error(`[Form Error: ${formName}]`, error);
}


