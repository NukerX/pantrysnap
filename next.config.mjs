/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Local linting still works; we just don't fail the production build on lint warnings.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow service worker scope at root
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
