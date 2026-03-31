import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const cmsUrlCandidates = [
  process.env.PAYLOAD_BASE_URL,
  process.env.PAYLOAD_PUBLIC_SERVER_URL,
  process.env.NEXT_PUBLIC_PAYLOAD_API_URL,
].filter(Boolean);

const cmsHosts = Array.from(
  new Set(
    cmsUrlCandidates
      .map((u) => {
        try {
          return new URL(u).hostname;
        } catch {
          return null;
        }
      })
      .filter(Boolean),
  ),
);

/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // Allow images served by the Payload CMS (media uploads).
      ...cmsHosts.flatMap((hostname) => [
        { protocol: 'https', hostname, port: '', pathname: '/**' },
        { protocol: 'http', hostname, port: '', pathname: '/**' },
      ]),
    ],
  },
};

export default withNextIntl(nextConfig);
