export const TrustFeedBlock = {
  slug: 'trustFeed',
  labels: {
    singular: 'Trust Feed',
    plural: 'Trust Feeds',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: false,
    },
    {
      name: 'minRating',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 5,
      admin: {
        description: 'Minimum rating to display (default 4)',
      },
    },
    {
      name: 'allowPositiveOnly',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Only show reviews at or above the minimum rating',
      },
    },
    {
      name: 'reviews',
      type: 'array',
      fields: [
        { name: 'platform', type: 'text' },
        { name: 'rating', type: 'number', min: 1, max: 5 },
        { name: 'quote', type: 'textarea' },
        { name: 'author', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
  ],
};
