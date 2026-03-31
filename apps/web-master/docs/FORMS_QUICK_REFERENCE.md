# Forms & Validation - Quick Reference Guide

**Quick access guide for common form tasks**

---

## 📋 Quick Links

- **Full Documentation**: [`docs/FORMS_AND_VALIDATION_COMPLETE.md`](./FORMS_AND_VALIDATION_COMPLETE.md)
- **Completion Report**: [`AGENT_23_FORMS_VALIDATION_COMPLETION_REPORT.md`](../AGENT_23_FORMS_VALIDATION_COMPLETION_REPORT.md)

---

## 🎯 All Forms at a Glance

| Form | Location | Purpose |
|------|----------|---------|
| ContactForm | `src/components/contact/ContactForm.tsx` | General contact |
| DynamicContactForm | `src/components/contact/DynamicContactForm.tsx` | CMS-driven forms |
| NewsletterSection | `src/components/common/NewsletterSection.tsx` | Newsletter signup |
| SignupHero | `src/components/marketing/SignupHero.tsx` | User registration |
| HelpSearchField | `src/components/help/HelpSearchField.tsx` | Help search |
| CookiePreferencesModal | `src/components/modals/CookiePreferencesModal.tsx` | Cookie consent |

---

## 🚀 Adding a New Form (5 Steps)

### 1. Create Schema

```typescript
// src/lib/validation/myFormSchemas.ts
import { z } from "zod";

export const myFormSchema = z.object({
  email: z.string().email("forms.validation.emailInvalid"),
  name: z.string().min(2, "forms.validation.nameMin"),
});

export type MyFormData = z.infer<typeof myFormSchema>;
```

### 2. Export Schema

```typescript
// src/lib/validation/index.ts
export * from './myFormSchemas';
```

### 3. Add Translations

```json
// messages/en/common.json
{
  "forms": {
    "validation": {
      "nameMin": "Name must be at least 2 characters"
    },
    "success": {
      "myFormSubmitted": "Form submitted successfully!"
    }
  }
}
```

### 4. Create Component

```typescript
// src/components/myModule/MyForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { myFormSchema, MyFormData } from "@/lib/validation";
import { handleFormSubmission } from "@/lib/forms";
import { Input, Label, Button } from "@/components/ui";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function MyForm({ lang = "en" }) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MyFormData>({
    resolver: zodResolver(myFormSchema),
  });

  const onSubmit = async (data: MyFormData) => {
    setIsSubmitting(true);
    await handleFormSubmission(data, {
      endpoint: "/api/my-endpoint",
      intentTag: "my-form",
      lang,
    }, {
      onSuccess: () => setSubmitStatus("success"),
      onError: () => setSubmitStatus("error"),
    });
    setIsSubmitting(false);
  };

  if (submitStatus === "success") {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold">{t("forms.success.title")}</h3>
        <p>{t("forms.success.myFormSubmitted")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">{t("labels.name")}</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-red-500 text-sm">{t(errors.name.message)}</p>}
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <><Loader2 className="animate-spin" /> {t("forms.loading.submitting")}</> : t("buttons.submit")}
      </Button>
    </form>
  );
}
```

### 5. Use Component

```typescript
import { MyForm } from "@/components/myModule/MyForm";

<MyForm lang="en" />
```

---

## 📝 Common Validation Patterns

### Email

```typescript
email: z.string().email("forms.validation.emailInvalid")
```

### Required Text

```typescript
name: z.string().min(2, "forms.validation.nameMin").max(100, "forms.validation.nameMax")
```

### Optional Text

```typescript
company: z.string().optional().or(z.literal(""))
```

### Phone

```typescript
phone: z.string().min(10, "forms.validation.phoneMin").max(20, "forms.validation.phoneMax")
```

### Checkbox (Must be checked)

```typescript
acceptedTerms: z.boolean().refine((val) => val === true, {
  message: "forms.validation.termsRequired",
})
```

### Either/Or Fields

```typescript
z.object({
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(10).optional().or(z.literal("")),
}).refine((data) => data.email || data.phone, {
  message: "forms.validation.emailOrPhoneRequired",
  path: ["email"],
})
```

### Select/Dropdown

```typescript
department: z.enum(["sales", "support", "billing"], {
  errorMap: () => ({ message: "forms.validation.departmentRequired" })
})
```

---

## 🎨 UI Components

### Input

```typescript
<Input
  id="email"
  type="email"
  {...register("email")}
  placeholder={t("placeholders.email")}
/>
```

### Label

```typescript
<Label htmlFor="email">{t("labels.email")}</Label>
```

### Button

```typescript
<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? "Loading..." : "Submit"}
</Button>
```

### Checkbox

```typescript
<Checkbox
  id="terms"
  checked={acceptedTerms}
  onCheckedChange={(checked) => setValue("acceptedTerms", checked === true)}
/>
```

---

## 🌐 i18n Translation Keys

### Common Keys

```json
{
  "buttons": {
    "submit": "Submit",
    "send": "Send",
    "cancel": "Cancel"
  },
  "labels": {
    "email": "Email",
    "name": "Name",
    "message": "Message"
  },
  "placeholders": {
    "enterEmail": "Enter your email",
    "enterName": "Enter your name"
  },
  "forms": {
    "validation": {
      "emailInvalid": "Please enter a valid email",
      "nameMin": "Name must be at least 2 characters",
      "required": "This field is required"
    },
    "errors": {
      "submissionFailed": "Submission Failed",
      "networkError": "Network error. Please try again."
    },
    "success": {
      "title": "Success!",
      "contactSubmitted": "Your message has been sent."
    },
    "loading": {
      "submitting": "Submitting..."
    }
  }
}
```

---

## 🔧 Form Utilities

### Submit Form

```typescript
import { handleFormSubmission } from "@/lib/forms";

await handleFormSubmission(
  data,
  {
    endpoint: "/api/contact",
    method: "POST",
    intentTag: "contact-form",
    lang: "en",
  },
  {
    onSuccess: () => console.log("Success!"),
    onError: (error) => console.error(error),
  }
);
```

### Format Phone Number

```typescript
import { formatPhoneNumber } from "@/lib/forms";

const formatted = formatPhoneNumber("+15551234567");
// Returns: "+1 (555) 123-4567"
```

### Get Error Message

```typescript
import { getErrorMessage } from "@/lib/forms";

const message = getErrorMessage(errors.email);
```

---

## 🔌 API Endpoint Pattern

```typescript
// src/app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  intentTag: z.string(),
  formData: z.record(z.string(), z.any()),
  metadata: z.object({
    timestamp: z.string(),
    userAgent: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    
    // Process form...
    
    return NextResponse.json({
      success: true,
      message: "Form submitted successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## ✅ Form Component Checklist

Before deploying a new form, verify:

- [ ] Uses `useForm` with `zodResolver`
- [ ] Has `isSubmitting`, `submitStatus` state
- [ ] Uses `handleFormSubmission` utility
- [ ] All text uses `useTranslations()`
- [ ] Has success state UI
- [ ] Has error state UI
- [ ] Has loading state on button
- [ ] Uses shared UI components
- [ ] Proper label associations (`htmlFor`)
- [ ] Error messages next to fields
- [ ] Form resets after success
- [ ] Tested in all languages
- [ ] Tested on mobile

---

## 🐛 Common Issues & Solutions

### Issue: Validation not triggering

**Solution**: Make sure you're using `zodResolver`:

```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(myFormSchema), // ← Don't forget this!
});
```

### Issue: Translations not working

**Solution**: Check translation key exists in all language files:

```bash
# Check if key exists in all locales
grep -r "forms.validation.emailInvalid" messages/
```

### Issue: Form not resetting after success

**Solution**: Call `reset()` in success callback:

```typescript
onSuccess: () => {
  setSubmitStatus("success");
  reset(); // ← Add this
}
```

### Issue: Checkbox not updating

**Solution**: Use `setValue` instead of direct state:

```typescript
<Checkbox
  checked={watch("acceptedTerms")}
  onCheckedChange={(checked) => setValue("acceptedTerms", checked === true)}
/>
```

---

## 📚 File Locations

### Validation Schemas

```
src/lib/validation/
├── contactSchemas.ts
├── newsletterSchemas.ts
├── signupSchemas.ts
├── searchSchemas.ts
├── cookieSchemas.ts
└── dynamicFormSchemas.ts
```

### Form Utilities

```
src/lib/forms/
├── formHelpers.ts
├── formSubmission.ts
└── formErrorHandler.ts
```

### UI Components

```
src/components/ui/
├── input.tsx
├── label.tsx
├── button.tsx
└── checkbox.tsx
```

### Translations

```
messages/
├── en/common.json
├── es/common.json
├── zh-cn/common.json
└── zh-tw/common.json
```

---

## 🎓 Learning Resources

- **Full Documentation**: [`docs/FORMS_AND_VALIDATION_COMPLETE.md`](./FORMS_AND_VALIDATION_COMPLETE.md)
- **React Hook Form Docs**: https://react-hook-form.com/
- **Zod Docs**: https://zod.dev/
- **next-intl Docs**: https://next-intl-docs.vercel.app/

---

## 📞 Need Help?

1. Check the [full documentation](./FORMS_AND_VALIDATION_COMPLETE.md)
2. Review existing form components for examples
3. Check the [completion report](../AGENT_23_FORMS_VALIDATION_COMPLETION_REPORT.md)

---

**Last Updated:** December 3, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
