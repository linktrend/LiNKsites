/**
 * Form helper utilities
 */

/**
 * Get error message from React Hook Form errors
 */
export function getErrorMessage(error: any): string {
  if (typeof error?.message === 'string') {
    return error.message;
  }
  return '';
}

/**
 * Check if a form field has an error
 */
export function hasError(errors: any, fieldName: string): boolean {
  return !!errors[fieldName];
}

/**
 * Get field error message
 */
export function getFieldError(errors: any, fieldName: string): string | undefined {
  return errors[fieldName]?.message as string | undefined;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
  }
  return phone;
}

/**
 * Validate email format (basic check)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize form input (remove leading/trailing whitespace)
 */
export function sanitizeInput(value: string): string {
  return value.trim();
}

/**
 * Get form data as JSON
 */
export function getFormDataAsJSON(formData: FormData): Record<string, any> {
  const data: Record<string, any> = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });
  return data;
}


