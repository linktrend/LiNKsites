# Forms and Validation System - Complete Documentation

**Date:** December 3, 2025  
**Agent:** Agent 23  
**Status:** ✅ COMPLETE  
**Build Status:** ✅ VERIFIED

---

## Executive Summary

This document provides comprehensive documentation for the **Forms and Validation System** in the LinkTrend Master Template. All forms follow a standardized pattern using **React Hook Form + Zod**, are fully **i18n-compatible**, and are designed to be easily adapted for secondary templates and client sites.

### Key Features

- ✅ **Consistent Pattern**: All forms use React Hook Form + Zod
- ✅ **Type-Safe**: Full TypeScript support with type inference
- ✅ **i18n Ready**: All text uses next-intl translations
- ✅ **CMS-Friendly**: Dynamic form generation from CMS schemas
- ✅ **Reusable Components**: Shared UI components (Input, Label, Button, Checkbox)
- ✅ **Error Handling**: Comprehensive error handling and user feedback
- ✅ **API Integration**: Typed API endpoints with consistent JSON structure

---

## Table of Contents

1. [Forms Inventory](#forms-inventory)
2. [Standard Form Pattern](#standard-form-pattern)
3. [Validation Schemas](#validation-schemas)
4. [Form Utilities](#form-utilities)
5. [API Endpoints](#api-endpoints)
6. [Shared Components](#shared-components)
7. [i18n Integration](#i18n-integration)
8. [Adding New Forms](#adding-new-forms)
9. [CMS-Driven Forms](#cms-driven-forms)
10. [Best Practices](#best-practices)
11. [Migration Guide for Secondary Templates](#migration-guide-for-secondary-templates)

---

## Forms Inventory

### All Forms in the Application

| Form Component | Location | Purpose | Schema | Endpoint | Status |
|----------------|----------|---------|--------|----------|--------|
| **ContactForm** | `src/components/contact/ContactForm.tsx` | General contact submissions | `contactFormSchema` | `/api/contact` | ✅ Complete |
| **DynamicContactForm** | `src/components/contact/DynamicContactForm.tsx` | CMS-driven contact forms | Dynamic (generated) | Configurable | ✅ Complete |
| **NewsletterSection** | `src/components/common/NewsletterSection.tsx` | Newsletter subscriptions | `newsletterSchema` | N/A (mock) | ✅ Complete |
| **SignupHero** | `src/components/marketing/SignupHero.tsx` | User registration/signup | `signupFormSchema` | N/A (redirects) | ✅ Complete |
| **HelpSearchField** | `src/components/help/HelpSearchField.tsx` | Help center search | `searchFormSchema` | N/A (client-side) | ✅ Complete |
| **CookiePreferencesModal** | `src/components/modals/CookiePreferencesModal.tsx` | Cookie consent management | N/A (direct state) | N/A (localStorage) | ✅ Complete |

### Form Details

#### 1. ContactForm
- **Purpose**: General contact form for user inquiries
- **Fields**: name, email, message, captcha (optional)
- **Validation**: Min/max length, email format, captcha verification
- **Submission**: Posts to `/api/contact` with webhook integration
- **Success/Error**: Full UI feedback with translated messages

#### 2. DynamicContactForm
- **Purpose**: CMS-configurable contact forms for different intents
- **Fields**: Dynamic based on CMS configuration
- **Validation**: Generated from CMS field definitions
- **Submission**: Configurable endpoint per form
- **Success/Error**: Customizable messages from CMS

#### 3. NewsletterSection
- **Purpose**: Newsletter subscription signup
- **Fields**: email, acceptedTerms
- **Validation**: Email format, terms acceptance required
- **Submission**: Currently mocked (ready for API integration)
- **Success/Error**: Inline success message with auto-dismiss

#### 4. SignupHero
- **Purpose**: User registration with email or phone
- **Fields**: email (optional), phone (optional), acceptedTerms
- **Validation**: At least one of email/phone required, terms acceptance
- **Submission**: Redirects to contact page
- **Success/Error**: Client-side validation only

#### 5. HelpSearchField
- **Purpose**: Search help articles and documentation
- **Fields**: query
- **Validation**: Min 2, max 200 characters
- **Submission**: Client-side search (ready for backend integration)
- **Success/Error**: Inline error display

#### 6. CookiePreferencesModal
- **Purpose**: Manage cookie consent preferences
- **Fields**: functional, analytics, marketing (switches)
- **Validation**: None (all optional except necessary)
- **Submission**: Saves to localStorage, triggers analytics
- **Success/Error**: Auto-closes on save

---

## Standard Form Pattern

### Basic Form Structure

All forms in the application follow this standard pattern:

```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { myFormSchema, MyFormData } from "@/lib/validation";
import { handleFormSubmission } from "@/lib/forms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface MyFormProps {
  lang?: string;
}

export function MyForm({ lang = "en" }: MyFormProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Initialize form with React Hook Form + Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<MyFormData>({
    resolver: zodResolver(myFormSchema),
    defaultValues: {
      // Set default values for all fields
    },
  });

  // Form submission handler
  const onSubmit = async (data: MyFormData) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    const result = await handleFormSubmission(
      data,
      {
        endpoint: "/api/my-endpoint",
        method: "POST",
        intentTag: "my-form",
        lang,
      },
      {
        onSuccess: () => {
          setSubmitStatus("success");
          reset();
        },
        onError: (error) => {
          setSubmitStatus("error");
          setErrorMessage(error.message);
        },
      }
    );

    setIsSubmitting(false);
  };

  // Success state UI
  if (submitStatus === "success") {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          {t("forms.success.title")}
        </h3>
        <p className="text-muted-foreground">{t("forms.success.myFormSubmitted")}</p>
      </div>
    );
  }

  // Form UI
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Form Fields */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="fieldName" className="text-sm font-medium">
          {t("labels.fieldName")}
        </Label>
        <Input
          id="fieldName"
          {...register("fieldName")}
          placeholder={t("placeholders.fieldName")}
        />
        {errors.fieldName && (
          <p className="text-sm text-red-500 mt-1">
            {t(errors.fieldName.message as string)}
          </p>
        )}
      </div>

      {/* Error Message */}
      {submitStatus === "error" && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">
              {t("forms.errors.submissionFailed")}
            </p>
            <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t("forms.loading.submitting")}
          </>
        ) : (
          t("buttons.submit")
        )}
      </Button>
    </form>
  );
}
```

### Key Pattern Elements

1. **Client Component**: All forms use `"use client"` directive
2. **State Management**: Three states - `isSubmitting`, `submitStatus`, `errorMessage`
3. **Form Hook**: React Hook Form with Zod resolver
4. **Translations**: All text uses `useTranslations()` from next-intl
5. **Validation**: Zod schemas with i18n error messages
6. **Submission**: Centralized `handleFormSubmission` utility
7. **UI Feedback**: Success and error states with icons
8. **Accessibility**: Proper labels, error associations, ARIA attributes

---

## Validation Schemas

### Schema Directory Structure

```
src/lib/validation/
├── index.ts                    # Main export file
├── contactSchemas.ts           # Contact form validation
├── newsletterSchemas.ts        # Newsletter validation
├── signupSchemas.ts            # Signup form validation
├── searchSchemas.ts            # Search form validation
├── cookieSchemas.ts            # Cookie preferences validation
└── dynamicFormSchemas.ts       # CMS-driven form generation
```

### Schema Examples

#### Contact Form Schema

```typescript
// src/lib/validation/contactSchemas.ts
import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "forms.validation.nameMin")
    .max(100, "forms.validation.nameMax"),
  email: z
    .string()
    .email("forms.validation.emailInvalid"),
  message: z
    .string()
    .min(10, "forms.validation.messageMin")
    .max(1000, "forms.validation.messageMax"),
  captcha: z
    .boolean()
    .refine((val) => val === true, {
      message: "forms.validation.captchaRequired",
    })
    .optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
```

#### Newsletter Schema

```typescript
// src/lib/validation/newsletterSchemas.ts
import { z } from "zod";

export const newsletterSchema = z.object({
  email: z
    .string()
    .email("forms.validation.emailInvalid"),
  acceptedTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: "forms.validation.termsRequired",
    }),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;
```

#### Signup Form Schema (Complex Validation)

```typescript
// src/lib/validation/signupSchemas.ts
import { z } from "zod";

export const signupFormSchema = z.object({
  email: z
    .string()
    .email("forms.validation.emailInvalid")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(10, "forms.validation.phoneMin")
    .max(20, "forms.validation.phoneMax")
    .optional()
    .or(z.literal("")),
  acceptedTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: "forms.validation.termsRequired",
    }),
}).refine(
  (data) => data.email || data.phone,
  {
    message: "forms.validation.emailOrPhoneRequired",
    path: ["email"],
  }
);

export type SignupFormData = z.infer<typeof signupFormSchema>;
```

### Schema Best Practices

1. **i18n Keys**: Use translation keys for error messages (e.g., `"forms.validation.emailInvalid"`)
2. **Type Inference**: Always export inferred types using `z.infer<typeof schema>`
3. **Validation Logic**: Keep validation logic in schemas, not components
4. **Reusable Patterns**: Create shared schema fragments for common fields
5. **Complex Validation**: Use `.refine()` for custom validation logic

---

## Form Utilities

### Utility Directory Structure

```
src/lib/forms/
├── index.ts                    # Main export file
├── formHelpers.ts              # Helper functions
├── formSubmission.ts           # Submission utilities
└── formErrorHandler.ts         # Error handling utilities
```

### Form Submission Utilities

#### `submitForm()`

```typescript
// src/lib/forms/formSubmission.ts
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
```

#### `handleFormSubmission()`

```typescript
// src/lib/forms/formSubmission.ts
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
```

### Form Helper Utilities

```typescript
// src/lib/forms/formHelpers.ts

// Get error message from React Hook Form errors
export function getErrorMessage(error: any): string {
  if (typeof error?.message === 'string') {
    return error.message;
  }
  return '';
}

// Check if a form field has an error
export function hasError(errors: any, fieldName: string): boolean {
  return !!errors[fieldName];
}

// Get field error message
export function getFieldError(errors: any, fieldName: string): string | undefined {
  return errors[fieldName]?.message as string | undefined;
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
  }
  return phone;
}

// Validate email format (basic check)
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize form input (remove leading/trailing whitespace)
export function sanitizeInput(value: string): string {
  return value.trim();
}
```

### Error Handler Utilities

```typescript
// src/lib/forms/formErrorHandler.ts

export interface FormError {
  field?: string;
  message: string;
  code?: string;
}

// Parse API error response
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

// Get user-friendly error message
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

// Log form error for debugging
export function logFormError(formName: string, error: any): void {
  console.error(`[Form Error: ${formName}]`, error);
}
```

---

## API Endpoints

### Contact API Endpoint

**Location**: `src/app/api/contact/route.ts`

#### Request Payload

```typescript
interface FormSubmissionPayload {
  intentTag: string;              // Form intent identifier
  formData: Record<string, any>;  // Form field data
  metadata?: {
    timestamp: string;            // ISO timestamp
    userAgent?: string;           // Browser user agent
    referrer?: string;            // Page referrer
    language?: string;            // User language
  };
}
```

#### Response Format

```typescript
interface FormSubmissionResponse {
  success: boolean;               // Submission success status
  message?: string;               // Success message
  error?: string;                 // Error message (if failed)
}
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Contact request received successfully"
}
```

#### Error Responses

**Validation Error (400)**
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Please check your form inputs and try again",
  "details": [
    {
      "path": "formData.email",
      "message": "Invalid email format"
    }
  ]
}
```

**Request Too Large (413)**
```json
{
  "success": false,
  "error": "Request too large",
  "message": "The request payload exceeds the maximum allowed size"
}
```

**Server Error (500)**
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred. Please try again later"
}
```

#### Features

- ✅ **Zod Validation**: Server-side validation with Zod schemas
- ✅ **Webhook Integration**: Forwards to N8N or other webhooks
- ✅ **Retry Logic**: Exponential backoff for webhook failures
- ✅ **Security**: Request size limits, input sanitization, no data leaks
- ✅ **Metadata Collection**: Timestamp, user agent, referrer, language, IP
- ✅ **Error Handling**: Comprehensive error handling with user-friendly messages
- ✅ **CORS Support**: OPTIONS endpoint for CORS preflight

#### Environment Variables

```bash
# Webhook Configuration
CONTACT_WEBHOOK_URL=https://your-webhook-url.com
CONTACT_WEBHOOK_SECRET=your-secret-key
CONTACT_FALLBACK_EMAIL=contact@yoursite.com
```

---

## Shared Components

### UI Components

All forms use shared UI components from `src/components/ui/`:

#### Input Component

```typescript
// src/components/ui/input.tsx
import { forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed",
          "disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
```

#### Label Component

```typescript
// src/components/ui/label.tsx
export const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
);
```

#### Button Component

```typescript
// src/components/ui/button.tsx
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

#### Checkbox Component

```typescript
// src/components/ui/checkbox.tsx
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

export const Checkbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
```

### Benefits of Shared Components

1. **Consistency**: All forms have the same look and feel
2. **Maintainability**: Update once, applies everywhere
3. **Accessibility**: Built-in ARIA attributes and keyboard navigation
4. **Theming**: Consistent with design system tokens
5. **Type Safety**: Full TypeScript support

---

## i18n Integration

### Translation Keys Structure

All form-related translations are in `messages/{locale}/common.json`:

```json
{
  "buttons": {
    "submit": "Submit",
    "send": "Send",
    "save": "Save",
    "cancel": "Cancel",
    "search": "Search",
    "createAccount": "Create Account",
    "joinNewsletter": "Join Newsletter"
  },
  "labels": {
    "email": "Email",
    "phone": "Phone",
    "name": "Name",
    "message": "Message",
    "subject": "Subject",
    "query": "Search Query"
  },
  "placeholders": {
    "enterEmail": "Enter your email",
    "email": "your@email.com",
    "enterName": "Enter your name",
    "enterMessage": "Enter your message",
    "search": "Search...",
    "phone": "+1 (555) 123-4567"
  },
  "forms": {
    "validation": {
      "nameMin": "Name must be at least 2 characters",
      "nameMax": "Name must be at most 100 characters",
      "emailInvalid": "Please enter a valid email address",
      "emailOrPhoneRequired": "Please provide either an email or phone number",
      "phoneMin": "Phone number must be at least 10 digits",
      "phoneMax": "Phone number must be at most 20 digits",
      "messageMin": "Message must be at least 10 characters",
      "messageMax": "Message must be at most 1000 characters",
      "searchMin": "Search query must be at least 2 characters",
      "searchMax": "Search query must be at most 200 characters",
      "minLength": "This field must be at least {min} characters",
      "maxLength": "This field must be at most {max} characters",
      "termsRequired": "You must accept the terms and conditions",
      "captchaRequired": "Please verify you are not a robot",
      "required": "This field is required"
    },
    "errors": {
      "submissionFailed": "Submission Failed",
      "networkError": "Network error. Please try again or contact us directly via email.",
      "validationError": "Please check your form inputs and try again",
      "unknownError": "An unexpected error occurred. Please try again."
    },
    "success": {
      "title": "Success!",
      "contactSubmitted": "Your message has been sent successfully. We'll get back to you soon.",
      "newsletterSubscribed": "You've been successfully subscribed to our newsletter.",
      "preferencesUpdated": "Your preferences have been saved successfully."
    },
    "loading": {
      "submitting": "Submitting...",
      "loading": "Loading..."
    }
  },
  "legal": {
    "acceptTerms": "I accept the",
    "privacyPolicy": "Privacy Policy",
    "termsOfUse": "Terms of Use",
    "and": "and"
  }
}
```

### Using Translations in Forms

```typescript
import { useTranslations } from "next-intl";

export function MyForm() {
  const t = useTranslations();

  return (
    <form>
      <Label>{t("labels.email")}</Label>
      <Input placeholder={t("placeholders.email")} />
      <Button>{t("buttons.submit")}</Button>
      {errors.email && (
        <p>{t(errors.email.message as string)}</p>
      )}
    </form>
  );
}
```

### Translation Coverage

| Language | Code | Status | Coverage |
|----------|------|--------|----------|
| English | en | ✅ Complete | 100% |
| Spanish | es | ✅ Complete | 100% |
| Chinese (Simplified) | zh-cn | ✅ Complete | 100% |
| Chinese (Traditional) | zh-tw | ✅ Complete | 100% |

---

## Adding New Forms

### Step-by-Step Guide

#### 1. Create Validation Schema

```typescript
// src/lib/validation/myFormSchemas.ts
import { z } from "zod";

export const myFormSchema = z.object({
  fieldName: z
    .string()
    .min(2, "forms.validation.fieldNameMin")
    .max(100, "forms.validation.fieldNameMax"),
  // Add more fields...
});

export type MyFormData = z.infer<typeof myFormSchema>;
```

#### 2. Export Schema

```typescript
// src/lib/validation/index.ts
export * from './myFormSchemas';
```

#### 3. Add Translations

```json
// messages/en/common.json
{
  "forms": {
    "validation": {
      "fieldNameMin": "Field name must be at least 2 characters",
      "fieldNameMax": "Field name must be at most 100 characters"
    },
    "success": {
      "myFormSubmitted": "Your form has been submitted successfully!"
    }
  },
  "labels": {
    "fieldName": "Field Name"
  },
  "placeholders": {
    "fieldName": "Enter field name"
  }
}
```

#### 4. Create Form Component

```typescript
// src/components/myModule/MyForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { myFormSchema, MyFormData } from "@/lib/validation";
import { handleFormSubmission } from "@/lib/forms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface MyFormProps {
  lang?: string;
}

export function MyForm({ lang = "en" }: MyFormProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MyFormData>({
    resolver: zodResolver(myFormSchema),
    defaultValues: {
      fieldName: "",
    },
  });

  const onSubmit = async (data: MyFormData) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    await handleFormSubmission(
      data,
      {
        endpoint: "/api/my-endpoint",
        method: "POST",
        intentTag: "my-form",
        lang,
      },
      {
        onSuccess: () => {
          setSubmitStatus("success");
          reset();
        },
        onError: (error) => {
          setSubmitStatus("error");
          setErrorMessage(error.message);
        },
      }
    );

    setIsSubmitting(false);
  };

  if (submitStatus === "success") {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          {t("forms.success.title")}
        </h3>
        <p className="text-muted-foreground">{t("forms.success.myFormSubmitted")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="fieldName" className="text-sm font-medium">
          {t("labels.fieldName")}
        </Label>
        <Input
          id="fieldName"
          {...register("fieldName")}
          placeholder={t("placeholders.fieldName")}
        />
        {errors.fieldName && (
          <p className="text-sm text-red-500 mt-1">
            {t(errors.fieldName.message as string)}
          </p>
        )}
      </div>

      {submitStatus === "error" && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">
              {t("forms.errors.submissionFailed")}
            </p>
            <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t("forms.loading.submitting")}
          </>
        ) : (
          t("buttons.submit")
        )}
      </Button>
    </form>
  );
}
```

#### 5. Create API Endpoint (Optional)

```typescript
// src/app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const myApiSchema = z.object({
  intentTag: z.string(),
  formData: z.record(z.string(), z.any()),
  metadata: z.object({
    timestamp: z.string(),
    userAgent: z.string().optional(),
    referrer: z.string().optional(),
    language: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validated = myApiSchema.parse(body);

    // Process form submission
    console.log("Form submission:", validated);

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Form submitted successfully",
    });
  } catch (error) {
    console.error("[API Error]", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: "Please check your form inputs and try again",
        },
        { status: 400 }
      );
    }

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
```

---

## CMS-Driven Forms

### Dynamic Form Generation

The `DynamicContactForm` component generates forms from CMS configurations:

#### CMS Form Schema

```typescript
interface CmsContactForm {
  id: string;
  title: string;
  description: string;
  fields: CmsFormField[];
  submitButtonText: string;
  successMessage: string;
  submissionConfig: {
    endpoint: string;
    method: string;
    intentTag: string;
  };
}

interface CmsFormField {
  id: string;
  type: 'text' | 'email' | 'select' | 'textarea';
  label: string;
  placeholder: string;
  required: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  options?: Array<{
    value: string;
    label: string;
  }>;
}
```

#### Dynamic Schema Generation

```typescript
// src/lib/validation/dynamicFormSchemas.ts
import { z } from "zod";
import { CmsContactForm, CmsFormField } from "../contactTypes";

export function generateZodSchema(formSchema: CmsContactForm) {
  const shape: Record<string, z.ZodTypeAny> = {};

  formSchema.fields.forEach((field) => {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "text":
        fieldSchema = z.string();
        if (field.validation?.minLength) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            field.validation.minLength,
            `forms.validation.minLength`
          );
        }
        if (field.validation?.maxLength) {
          fieldSchema = (fieldSchema as z.ZodString).max(
            field.validation.maxLength,
            `forms.validation.maxLength`
          );
        }
        break;

      case "email":
        fieldSchema = z.string().email("forms.validation.emailInvalid");
        break;

      case "select":
        if (field.options && field.options.length >= 2) {
          const validValues = field.options.map((opt) => opt.value);
          fieldSchema = z.enum(validValues as [string, string, ...string[]]);
        } else {
          fieldSchema = z.string();
        }
        break;

      case "textarea":
        fieldSchema = z.string();
        if (field.validation?.minLength) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            field.validation.minLength,
            `forms.validation.minLength`
          );
        }
        if (field.validation?.maxLength) {
          fieldSchema = (fieldSchema as z.ZodString).max(
            field.validation.maxLength,
            `forms.validation.maxLength`
          );
        }
        break;

      default:
        fieldSchema = z.string();
    }

    if (!field.required) {
      fieldSchema = fieldSchema.optional().or(z.literal(""));
    }

    shape[field.id] = fieldSchema;
  });

  return z.object(shape);
}
```

#### Usage

```typescript
import { DynamicContactForm } from "@/components/contact/DynamicContactForm";

const formConfig: CmsContactForm = {
  id: "sales-inquiry",
  title: "Sales Inquiry",
  description: "Tell us about your needs",
  fields: [
    {
      id: "company",
      type: "text",
      label: "Company Name",
      placeholder: "Enter company name",
      required: true,
      validation: { minLength: 2, maxLength: 100 }
    },
    {
      id: "email",
      type: "email",
      label: "Email",
      placeholder: "your@company.com",
      required: true
    }
  ],
  submitButtonText: "Submit Inquiry",
  successMessage: "Thank you! We'll be in touch soon.",
  submissionConfig: {
    endpoint: "/api/contact",
    method: "POST",
    intentTag: "sales-inquiry"
  }
};

<DynamicContactForm formSchema={formConfig} lang="en" />
```

---

## Best Practices

### Form Design

1. **Keep Forms Short**: Only ask for essential information
2. **Clear Labels**: Use descriptive labels for all fields
3. **Helpful Placeholders**: Provide examples in placeholders
4. **Inline Validation**: Show errors immediately after field blur
5. **Success Feedback**: Always show success state after submission
6. **Loading States**: Disable submit button and show loading indicator
7. **Error Recovery**: Preserve form data on error, allow easy retry

### Validation

1. **Client + Server**: Always validate on both client and server
2. **i18n Messages**: Use translation keys for all error messages
3. **Specific Errors**: Provide specific, actionable error messages
4. **Field-Level**: Show errors next to the relevant field
5. **Required Fields**: Clearly mark required fields with asterisk
6. **Progressive Disclosure**: Show complex validation only when needed

### Accessibility

1. **Labels**: Always use `<Label>` with `htmlFor` attribute
2. **ARIA**: Add ARIA attributes for screen readers
3. **Keyboard Navigation**: Ensure all fields are keyboard accessible
4. **Focus Management**: Manage focus on error and success states
5. **Error Announcements**: Use ARIA live regions for error messages
6. **Color Independence**: Don't rely solely on color for errors

### Performance

1. **Memoization**: Use `useMemo` for expensive schema generation
2. **Debouncing**: Debounce validation for real-time fields
3. **Code Splitting**: Lazy load large form components
4. **Optimistic UI**: Show success immediately, sync in background
5. **Bundle Size**: Keep validation schemas lean

### Security

1. **Input Sanitization**: Sanitize all user inputs on server
2. **Rate Limiting**: Implement rate limiting on API endpoints
3. **CSRF Protection**: Use CSRF tokens for sensitive forms
4. **Data Validation**: Always validate data types and ranges
5. **No Sensitive Data**: Never log sensitive form data

---

## Migration Guide for Secondary Templates

### For Client Sites and Secondary Templates

When adapting forms for a new client site or secondary template:

#### 1. Copy Core Files

Copy these files to your new project:

```
src/lib/validation/
src/lib/forms/
src/components/ui/input.tsx
src/components/ui/label.tsx
src/components/ui/button.tsx
src/components/ui/checkbox.tsx
```

#### 2. Install Dependencies

```bash
npm install react-hook-form @hookform/resolvers zod next-intl
```

#### 3. Configure i18n

Add form translations to your `messages/{locale}/common.json`:

```json
{
  "forms": {
    "validation": { /* ... */ },
    "errors": { /* ... */ },
    "success": { /* ... */ },
    "loading": { /* ... */ }
  },
  "labels": { /* ... */ },
  "placeholders": { /* ... */ },
  "buttons": { /* ... */ }
}
```

#### 4. Customize Validation

Modify validation schemas in `src/lib/validation/` to match client requirements:

```typescript
// Adjust min/max lengths, patterns, etc.
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "forms.validation.nameMin")
    .max(100, "forms.validation.nameMax"),
  // ... customize as needed
});
```

#### 5. Update API Endpoints

Configure webhook URLs and endpoints in environment variables:

```bash
CONTACT_WEBHOOK_URL=https://client-webhook.com
CONTACT_WEBHOOK_SECRET=client-secret
```

#### 6. Customize UI Components

Adjust shared components to match client branding:

```typescript
// src/components/ui/button.tsx
// Update colors, sizes, variants to match brand
```

#### 7. Test Thoroughly

- ✅ Test all forms in all languages
- ✅ Test validation edge cases
- ✅ Test API integration
- ✅ Test error handling
- ✅ Test accessibility
- ✅ Test on mobile devices

### Common Customizations

#### Change Validation Rules

```typescript
// More lenient name validation
name: z.string().min(1, "forms.validation.nameRequired")

// Different email pattern
email: z.string().regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, "forms.validation.emailInvalid")

// Custom phone validation
phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "forms.validation.phoneInvalid")
```

#### Add Custom Fields

```typescript
// Add new field to schema
export const contactFormSchema = z.object({
  // ... existing fields
  department: z.enum(["sales", "support", "billing"], {
    errorMap: () => ({ message: "forms.validation.departmentRequired" })
  }),
});
```

#### Custom Success Messages

```typescript
// Override success message per form
if (submitStatus === "success") {
  return (
    <div className="text-center py-8">
      <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">
        {customSuccessTitle || t("forms.success.title")}
      </h3>
      <p className="text-muted-foreground">
        {customSuccessMessage || t("forms.success.contactSubmitted")}
      </p>
    </div>
  );
}
```

#### Different API Endpoints

```typescript
// Use different endpoint per environment
const endpoint = process.env.NODE_ENV === "production"
  ? "/api/contact"
  : "/api/contact-dev";

await handleFormSubmission(data, {
  endpoint,
  method: "POST",
  intentTag: "contact-form",
  lang,
});
```

---

## Conclusion

The Forms and Validation System in LinkTrend provides a robust, scalable, and maintainable foundation for all form interactions. By following the patterns and best practices documented here, developers can:

- ✅ **Quickly add new forms** using the standard pattern
- ✅ **Ensure consistency** across all forms in the application
- ✅ **Maintain type safety** with TypeScript and Zod
- ✅ **Support multiple languages** with next-intl
- ✅ **Adapt for client sites** with minimal customization
- ✅ **Scale confidently** with proven patterns

### Key Takeaways

1. **Always use React Hook Form + Zod** for form validation
2. **Always use i18n translation keys** for all user-facing text
3. **Always use shared UI components** for consistency
4. **Always validate on both client and server** for security
5. **Always provide clear feedback** for success and error states
6. **Always test thoroughly** before deploying to production

### Next Steps

- Review existing forms and ensure they follow this pattern
- Add any missing translations to language files
- Implement API endpoints for forms that need backend integration
- Test forms across all supported languages and devices
- Document any client-specific customizations

---

**Document Version:** 1.0  
**Last Updated:** December 3, 2025  
**Maintained By:** Agent 23  
**Status:** ✅ Production Ready
