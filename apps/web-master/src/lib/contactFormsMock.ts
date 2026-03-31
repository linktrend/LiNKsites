import { CmsContactForm } from "./contactTypes";

export const mockContactForms: CmsContactForm[] = [
  {
    id: "sales-form",
    title: "Sales Inquiry",
    description: "Tell us about your needs and we'll connect you with the right team member",
    fields: [
      {
        id: "firstName",
        type: "text",
        label: "First Name",
        placeholder: "John",
        required: true,
        validation: { minLength: 2, maxLength: 50 }
      },
      {
        id: "lastName",
        type: "text",
        label: "Last Name",
        placeholder: "Doe",
        required: true,
        validation: { minLength: 2, maxLength: 50 }
      },
      {
        id: "email",
        type: "email",
        label: "Email",
        placeholder: "john@company.com",
        required: true,
        validation: { pattern: "email" }
      },
      {
        id: "company",
        type: "text",
        label: "Company Name",
        placeholder: "Acme Corp",
        required: false,
        validation: { minLength: 2, maxLength: 100 }
      },
      {
        id: "companySize",
        type: "select",
        label: "Company Size",
        placeholder: "Select Size",
        required: false,
        options: [
          { value: "1-10", label: "1-10 employees" },
          { value: "11-50", label: "11-50 employees" },
          { value: "51-200", label: "51-200 employees" },
          { value: "201-1000", label: "201-1000 employees" },
          { value: "1000+", label: "1000+ employees" }
        ]
      },
      {
        id: "category",
        type: "select",
        label: "Select Category",
        placeholder: "Select Category",
        required: true,
        options: [
          { value: "our-solutions", label: "Our Solutions" },
          { value: "demo-request", label: "Demo Request" },
          { value: "pricing-quote", label: "Pricing Quote" },
          { value: "partnership", label: "Partnership" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "message",
        type: "textarea",
        label: "Tell Us About Your Needs",
        placeholder: "What challenges are you looking to solve?",
        required: true,
        validation: { minLength: 20, maxLength: 1000 }
      }
    ],
    submitButtonText: "Send Inquiry",
    successMessage: "Thank you! We'll be in touch within 24 hours.",
    submissionConfig: {
      endpoint: "/api/contact",
      method: "POST",
      intentTag: "sales-inquiry"
    }
  },
  {
    id: "support-form",
    title: "Customer Support",
    description: "Describe your issue and we'll help you resolve it",
    fields: [
      {
        id: "firstName",
        type: "text",
        label: "First Name",
        placeholder: "John",
        required: true,
        validation: { minLength: 2, maxLength: 50 }
      },
      {
        id: "lastName",
        type: "text",
        label: "Last Name",
        placeholder: "Doe",
        required: true,
        validation: { minLength: 2, maxLength: 50 }
      },
      {
        id: "email",
        type: "email",
        label: "Email",
        placeholder: "john@company.com",
        required: true,
        validation: { pattern: "email" }
      },
      {
        id: "category",
        type: "select",
        label: "Select Category",
        placeholder: "Select Category",
        required: true,
        options: [
          { value: "technical-support", label: "Technical Support" },
          { value: "billing-question", label: "Billing Question" },
          { value: "account-issue", label: "Account Issue" },
          { value: "solutions-feedback", label: "Solutions Feedback" },
          { value: "return-refund", label: "Return/Refund" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "message",
        type: "textarea",
        label: "Describe Your Issue",
        placeholder: "Please provide as much detail as possible...",
        required: true,
        validation: { minLength: 20, maxLength: 2000 }
      }
    ],
    submitButtonText: "Submit Support Request",
    successMessage: "Support ticket created. Check your email for updates.",
    submissionConfig: {
      endpoint: "/api/contact",
      method: "POST",
      intentTag: "customer-support"
    }
  },
  {
    id: "billing-form",
    title: "Billing & Payments",
    description: "Questions about invoices, subscriptions, or payment methods",
    fields: [
      {
        id: "firstName",
        type: "text",
        label: "First Name",
        placeholder: "John",
        required: true,
        validation: { minLength: 2, maxLength: 50 }
      },
      {
        id: "lastName",
        type: "text",
        label: "Last Name",
        placeholder: "Doe",
        required: true,
        validation: { minLength: 2, maxLength: 50 }
      },
      {
        id: "email",
        type: "email",
        label: "Email",
        placeholder: "john@example.com",
        required: true,
        validation: { pattern: "email" }
      },
      {
        id: "category",
        type: "select",
        label: "Select Category",
        placeholder: "Select Category",
        required: true,
        options: [
          { value: "failed-payment", label: "Failed Payment" },
          { value: "refund-request", label: "Refund Request" },
          { value: "billing-query", label: "Billing Query" },
          { value: "subscription-issue", label: "Subscription Issue" },
          { value: "overcharge", label: "Overcharge" },
          { value: "invoice-question", label: "Invoice Question" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "message",
        type: "textarea",
        label: "Message",
        placeholder: "Tell us how we can help you...",
        required: true,
        validation: { minLength: 20, maxLength: 1000 }
      }
    ],
    submitButtonText: "Send Message",
    successMessage: "Message received. We'll respond within 1-2 business days.",
    submissionConfig: {
      endpoint: "/api/contact",
      method: "POST",
      intentTag: "billing-inquiry"
    }
  },
  {
    id: "enterprise-form",
    title: "Enterprise & Partnerships",
    description: "Custom solutions, integrations, or partnership opportunities",
    fields: [
      {
        id: "firstName",
        type: "text",
        label: "First Name",
        placeholder: "John",
        required: true,
        validation: { minLength: 2, maxLength: 50 }
      },
      {
        id: "lastName",
        type: "text",
        label: "Last Name",
        placeholder: "Doe",
        required: true,
        validation: { minLength: 2, maxLength: 50 }
      },
      {
        id: "email",
        type: "email",
        label: "Email",
        placeholder: "john@company.com",
        required: true,
        validation: { pattern: "email" }
      },
      {
        id: "company",
        type: "text",
        label: "Company name",
        placeholder: "Acme Corp",
        required: true,
        validation: { minLength: 2, maxLength: 100 }
      },
      {
        id: "companySize",
        type: "select",
        label: "Company size",
        placeholder: "Select size",
        required: true,
        options: [
          { value: "1-10", label: "1-10 employees" },
          { value: "11-50", label: "11-50 employees" },
          { value: "51-200", label: "51-200 employees" },
          { value: "201-1000", label: "201-1000 employees" },
          { value: "1000+", label: "1000+ employees" }
        ]
      },
      {
        id: "category",
        type: "select",
        label: "Select Category",
        placeholder: "Select Category",
        required: true,
        options: [
          { value: "our-solutions", label: "Our Solutions" },
          { value: "demo-request", label: "Demo Request" },
          { value: "pricing-quote", label: "Pricing Quote" },
          { value: "partnership", label: "Partnership" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "message",
        type: "textarea",
        label: "Tell Us About Your Needs",
        placeholder: "What challenges are you looking to solve?",
        required: true,
        validation: { minLength: 20, maxLength: 1000 }
      }
    ],
    submitButtonText: "Send Inquiry",
    successMessage: "Thank you! We'll be in touch within 24 hours.",
    submissionConfig: {
      endpoint: "/api/contact",
      method: "POST",
      intentTag: "enterprise-inquiry"
    }
  },
  {
    id: "technical-form",
    title: "Technical Consultation",
    description: "Architecture guidance, implementation support, or technical expertise",
    fields: [
      {
        id: "firstName",
        type: "text",
        label: "First Name",
        placeholder: "John",
        required: true,
        validation: { minLength: 2, maxLength: 50 }
      },
      {
        id: "lastName",
        type: "text",
        label: "Last Name",
        placeholder: "Doe",
        required: true,
        validation: { minLength: 2, maxLength: 50 }
      },
      {
        id: "email",
        type: "email",
        label: "Email",
        placeholder: "john@company.com",
        required: true,
        validation: { pattern: "email" }
      },
      {
        id: "category",
        type: "select",
        label: "Select Category",
        placeholder: "Select Category",
        required: true,
        options: [
          { value: "platform-not-working", label: "Platform Not Working" },
          { value: "integration-issue", label: "Integration Issue" },
          { value: "custom-report", label: "Custom Report" },
          { value: "implementation", label: "Implementation" },
          { value: "bug-report", label: "Bug Report" },
          { value: "feature-discussion", label: "Feature Discussion" },
          { value: "other", label: "Other" }
        ]
      },
      {
        id: "message",
        type: "textarea",
        label: "Describe Your Technical Needs",
        placeholder: "Please provide as much detail as possible...",
        required: true,
        validation: { minLength: 20, maxLength: 2000 }
      }
    ],
    submitButtonText: "Submit Request",
    successMessage: "Technical consultation request received. Our engineers will respond soon.",
    submissionConfig: {
      endpoint: "/api/contact",
      method: "POST",
      intentTag: "technical-consultation"
    }
  }
];
