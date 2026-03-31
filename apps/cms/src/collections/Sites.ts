import type { CollectionConfig, Field } from 'payload'
import { manageSitesAccess } from '@/access'
import { isBootstrapMode } from '@/utils/bootstrap'

export const Sites: CollectionConfig<'sites'> = {
  slug: 'sites',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'domain', 'defaultLanguage'],
  },
  access: {
    read: async ({ req }) => {
      if (await isBootstrapMode(req)) return true
      return manageSitesAccess({ req })
    },
    create: manageSitesAccess,
    update: manageSitesAccess,
    delete: manageSitesAccess,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Site name (e.g., LiNKtrend US)',
      },
    },
    {
      name: 'domain',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Primary domain (e.g., linktrend.com)',
      },
    },
    {
      name: 'templateId',
      type: 'text',
      required: true,
      defaultValue: 'marketing-smb-v1',
      admin: {
        description: 'Which frontend template module should render this site',
      },
    },
    {
      name: 'defaultLanguage',
      type: 'relationship',
      relationTo: 'languages',
      required: true,
      admin: {
        description: 'Default language for this site',
      },
    },
    {
      name: 'languages',
      type: 'relationship',
      relationTo: 'languages',
      hasMany: true,
      admin: {
        description: 'Supported languages for this site',
      },
    },
    {
      name: 'youtubeApiKey',
      type: 'text',
      admin: {
        description: 'YouTube Data API v3 key for video ingestion',
      },
    },
    {
      name: 'youtubeChannelId',
      type: 'text',
      admin: {
        description: 'YouTube channel ID for automatic sync',
      },
    },
    {
      name: 'youtubePlaylistIds',
      type: 'array',
      label: 'YouTube Playlists',
      admin: {
        description: 'Playlist IDs to sync videos from',
      },
      fields: [
        {
          name: 'playlistId',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'defaultVideoCategory',
      type: 'relationship',
      relationTo: 'video-categories',
      admin: {
        description: 'Default category for auto-ingested videos',
      },
    },
    {
      name: 'autoSyncEnabled',
      type: 'checkbox',
      label: 'Auto Sync Enabled',
      defaultValue: false,
      admin: {
        description: 'Enable automatic YouTube playlist sync',
      },
    },
    {
      name: 'syncFrequency',
      type: 'select',
      label: 'Sync Frequency',
      options: [
        { label: 'Hourly', value: 'hourly' },
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
      ],
      defaultValue: 'daily',
      admin: {
        condition: (data) => data?.autoSyncEnabled === true,
      },
    },
    {
      name: 'lastSyncedAt',
      type: 'date',
      label: 'Last Synced',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'rebuildWebhookUrl',
      type: 'text',
      label: 'Rebuild Webhook URL',
      admin: {
        description: 'Webhook URL to trigger site rebuild on content publish',
      },
    },
    {
      name: 'rebuildWebhookSecret',
      type: 'text',
      label: 'Rebuild Webhook Secret',
      admin: {
        description: 'Secret key for webhook authentication',
      },
    },
    {
      name: 'permissionOverrides',
      type: 'array',
      label: 'Permission Overrides',
      admin: {
        description: 'Override default role permissions for this site',
      },
      fields: [
        {
          name: 'role',
          type: 'relationship',
          relationTo: 'roles',
          required: true,
        },
        {
          name: 'permissions',
          type: 'group',
          fields: [
            {
              name: 'read',
              type: 'checkbox',
              label: 'Read',
            },
            {
              name: 'create',
              type: 'checkbox',
              label: 'Create',
            },
            {
              name: 'update',
              type: 'checkbox',
              label: 'Update',
            },
            {
              name: 'delete',
              type: 'checkbox',
              label: 'Delete',
            },
            {
              name: 'publish',
              type: 'checkbox',
              label: 'Publish',
            },
            {
              name: 'approve',
              type: 'checkbox',
              label: 'Approve',
            },
          ],
        },
      ],
    },
  ] satisfies Field[],
}
