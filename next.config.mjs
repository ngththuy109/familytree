/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: { unoptimized: true },
  // App is fully client-rendered (local-first); static export hosts free on
  // Vercel / Cloudflare Pages / GitHub Pages.
  trailingSlash: true,
};

export default nextConfig;
