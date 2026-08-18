# Contact Page System Documentation

## Overview

The contact page has been redesigned as a **Lead Qualification Engine** and **Intent Router** - fully CMS-driven, conversion-optimized, and automation-ready.

## Architecture

### Components

1. **ContactFormContext** - React Context for modal state management
2. **IntentGrid** - Displays 8 intent cards sorted by priority
3. **IntentCard** - Individual clickable intent card with icon
4. **ContactChannelList** - Secondary contact methods (email, chat, calendar)
5. **ContactChannelCard** - Individual channel card
6. **DynamicContactForm** - Form that renders based on CMS schema with Zod validation
7. **HelpDeflectionSection** - Links to help centre to reduce contact volume
8. **TrustFooter** - Trust signals and legal links

### Data Flow

```
CMS Payload (cmsPayload.json)
  ↓
ContactPageContent (loads mock data for now)
  ↓
ContactFormProvider (Context)
  ↓
Components render with CMS data
  ↓
User clicks intent → Opens modal with dynamic form
  ↓
Form submission → API route → signed LiNKautowork durable outbox → governed gateway
```

## CMS Schema

### Contact Section

Located in `data/cmsPayload.json`:

- `contact.page` - Page metadata (title, subtitle, SEO)
- `contact.intents[]` - 8 intent cards with actions
- `contact.channels[]` - Contact channels (email, chat, calendar)
- `contact.helpDeflection` - Help centre promotion
- `contact.trust` - Trust signals and legal links

### Contact Forms

Located in `data/cmsPayload.json` under `contactForms[]`:

- `sales-form` - For sales inquiries (7 fields including company size, timeline)
- `support-form` - For customer support (5 fields including issue category, priority)
- `general-form` - For general inquiries (5 basic fields)

## Form Validation

Uses Zod for runtime validation:

- Text fields: min/max length validation
- Email fields: email format validation
- Select fields: enum validation
- Textarea fields: min/max length validation

## API Integration

### Endpoint: `/api/contact`

**Request:**
```json
{
  "intentTag": "sales-inquiry",
  "formData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@company.com",
    ...
  },
  "metadata": {
    "timestamp": "2025-12-02T...",
    "userAgent": "...",
    "referrer": "...",
    "language": "en"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact request received successfully"
}
```

### Governed LiNKautowork delivery

Set environment variables:

```env
LINKAUTOWORK_GATEWAY_URL=https://gateway.example.com/events
LINKAUTOWORK_SIGNING_SECRET=ltfx.auto.linkautowork_signing_secret.d3d02483149b.v1 reference>
LINKAUTOWORK_SIGNING_KEY_ID=web-master
LINKAUTOWORK_ENVIRONMENT=production
LINKAUTOWORK_EVENT_GRANTS=[{"eventName":"contact.submitted","environments":["production"],"orgIds":["<org-id>"]}]
LINKAUTOWORK_OUTBOX_PATH=/var/lib/linksites/linkautowork-outbox.json
LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET=ltfx.fix2.linkautowork_outbox_integrity_secret.01ff6c3b8144.v1
LINKSITES_ORG_ID=<org-id>
LINKSITES_SITE_ID=<site-id>
```

The API route will:
1. Validate the payload with Zod
2. Enqueue a signed `contact.submitted` event; the recoverable worker owns retries and receipts
3. Log failures for manual recovery
4. Return success to user even if webhook fails (graceful degradation)

## Features

### ✅ Implemented

- 8 intent-based routing cards
- Dynamic form system with CMS-driven schemas
- Zod validation with helpful error messages
- Modal state management via React Context
- Retry logic for webhook failures
- Google Calendar integration for scheduling
- Email mailto links
- Help centre deflection
- Trust signals and legal links
- Fully responsive design
- Design system compliant (uses theme tokens)

### 🔮 Future Enhancements

- Load CMS data from actual CMS instead of mock data
- Analytics integration (GA4 events)
- Live chat widget integration
- Conditional form fields
- File upload support
- Multi-step forms
- A/B testing

## Usage

### For Developers

To add a new intent:

1. Add to `contact.intents[]` in CMS
2. Create form schema in `contactForms[]` if needed
3. No code changes required!

To add a new form field:

1. Add to form's `fields[]` array in CMS
2. Zod validation is generated automatically
3. Field renders automatically

### For Content Editors

All content is in `data/cmsPayload.json`:

- Edit intent titles, descriptions, icons
- Change form fields, labels, validation rules
- Update trust messaging
- Configure help deflection
- Modify channel availability text

## Testing

1. Visit `/contact` page
2. Click each intent card - modal should open with correct form
3. Test form validation - try submitting empty, invalid data
4. Test successful submission
5. Check browser console for API logs (dev mode)
6. Test email link (opens mailto)
7. Test calendar link (opens in new tab)
8. Test help centre link
9. Test on mobile, tablet, desktop

## Deployment Checklist

- [ ] Configure the signed LiNKautowork gateway, explicit org grant, and durable outbox
- [ ] Test gateway acknowledgement receipts and restart recovery locally
- [ ] Configure an explicit LiNKautowork event grant for the owning organization
- [ ] Set up email notifications as fallback
- [ ] Monitor API logs for errors
- [ ] Test all forms in production
- [ ] Verify Google Calendar link works

## Support

For issues or questions, see:
- Implementation plan: `/contact-page-system-redesign-dfae79.plan.md`
- Component source: `/src/components/contact/`
- API route: `/src/app/api/contact/route.ts`
- Types: `/src/lib/contactTypes.ts`
