// TypeScript types for Contact CMS schema

export interface CmsContactPage {
  title: string;
  subtitle: string;
  seoTitle: string;
  seoDescription: string;
}

export interface CmsContactIntent {
  id: string;
  title: string;
  description: string;
  icon: string;
  priorityRank: number;
  action: {
    type: 'modal' | 'link';
    formId: string | null;
    url: string | null;
  };
  audienceType: 'prospect' | 'customer' | 'partner' | 'media';
  trackingLabel: string;
}

export interface CmsContactChannel {
  id: string;
  channelType: 'email' | 'chat' | 'calendar';
  displayName: string;
  description: string;
  icon: string;
  availabilityText: string;
  badgeText: string | null;
  contactValue: string;
  priorityWeight: number;
}

export interface CmsHelpDeflection {
  enabled: boolean;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  featuredCategories: string[];
}

export interface CmsTrust {
  responseTimeText: string;
  serviceTierNote: string;
  reassuranceText: string;
  legalLinks: Array<{
    label: string;
    url: string;
  }>;
}

export interface CmsContact {
  page: CmsContactPage;
  intents: CmsContactIntent[];
  channels: CmsContactChannel[];
  helpDeflection: CmsHelpDeflection;
  trust: CmsTrust;
}

export interface CmsFormField {
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

export interface CmsContactForm {
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

export interface FormSubmissionPayload {
  intentTag: string;
  formData: Record<string, any>;
  metadata?: {
    timestamp: string;
    userAgent?: string;
    referrer?: string;
    language?: string;
  };
}

export interface FormSubmissionResponse {
  success: boolean;
  message?: string;
  error?: string;
}
