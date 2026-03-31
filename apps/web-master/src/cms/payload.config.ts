// @ts-nocheck - Payload CMS types will be available after installation
import { buildConfig } from 'payload/config';
import path from 'path';
import { CMS_PROVIDER, MEDIA_CONFIG } from '@/config';

// Import all collections
import { Offers } from './collections/Offers';
import { Navigation } from './collections/Navigation';
import { Pages } from './collections/Pages';
import { Resources } from './collections/Resources';
import { Cases } from './collections/Cases';
import { Videos } from './collections/Videos';
import { FAQ } from './collections/FAQ';
import { Legal } from './collections/Legal';

export default buildConfig({
  serverURL: CMS_PROVIDER.payload.serverUrl,
  
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- CMS',
      favicon: '/favicon.ico',
      ogImage: '/og-image.png',
    },
  },

  collections: [
    // Core business collections
    Offers,
    
    // Content collections
    Resources,
    Cases,
    Videos,
    FAQ,
    
    // Configuration collections
    Navigation,
    Pages,
    Legal,
    
    // Media collection (built-in)
    {
      slug: 'media',
      upload: {
        staticURL: MEDIA_CONFIG.staticUrl,
        staticDir: MEDIA_CONFIG.uploadDir,
        imageSizes: MEDIA_CONFIG.imageSizes,
        adminThumbnail: MEDIA_CONFIG.adminThumbnail,
        mimeTypes: MEDIA_CONFIG.mimeTypes,
      },
      fields: [
        {
          name: 'alt',
          type: 'text',
          required: true,
        },
      ],
    },
    
    // Users collection (required for admin)
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Editor', value: 'editor' },
            { label: 'Viewer', value: 'viewer' },
          ],
          defaultValue: 'editor',
          required: true,
        },
      ],
    },
  ],

  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },

  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },

  cors: [
    CMS_PROVIDER.payload.serverUrl,
  ].filter(Boolean),

  csrf: [
    CMS_PROVIDER.payload.serverUrl,
  ].filter(Boolean),
});




