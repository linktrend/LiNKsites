// @ts-nocheck - Payload CMS types will be available after installation
import { CollectionConfig } from 'payload/types';

export const Navigation: CollectionConfig = {
  slug: 'navigation',
  admin: {
    useAsTitle: 'menu_label',
    description: 'Global navigation configuration',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'menu_label',
      type: 'text',
      required: true,
      admin: {
        description: 'Default menu label',
      },
    },
    {
      name: 'plural_label',
      type: 'text',
      admin: {
        description: 'Plural form of the label',
      },
    },
    {
      name: 'fallback_label',
      type: 'text',
      admin: {
        description: 'Fallback label if computed label fails',
      },
    },
    {
      name: 'icon_reference',
      type: 'text',
      admin: {
        description: 'Icon identifier (e.g., lucide icon name)',
      },
    },
    {
      name: 'visibility_conditions',
      type: 'json',
      admin: {
        description: 'Conditions for showing/hiding navigation items',
      },
    },
    {
      name: 'override_enabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Enable manual override of computed labels',
      },
    },
    {
      name: 'override_reason',
      type: 'textarea',
      admin: {
        description: 'Reason for overriding computed label (governance)',
        condition: (data) => data.override_enabled === true,
      },
    },
    {
      name: 'computed_label_override',
      type: 'text',
      admin: {
        description: 'Manual override for dynamically computed labels (e.g., "Products & Services")',
        condition: (data) => data.override_enabled === true,
      },
    },
  ],
};






