import { z } from "zod";
import { CmsContactForm, CmsFormField } from "../contactTypes";

/**
 * Generates a Zod schema from a CMS form schema
 * This is used for dynamically generated forms from the CMS
 */
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

/**
 * Get default values for a form
 */
export function getDefaultValues(fields: CmsFormField[]): Record<string, any> {
  const defaults: Record<string, any> = {};
  fields.forEach((field) => {
    defaults[field.id] = "";
  });
  return defaults;
}


