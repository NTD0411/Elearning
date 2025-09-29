/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  basePath: isProd ? "/E-learning" : "",
  assetPrefix: isProd ? "/E-learning/" : "",
  // Remove 'output: "export"' when using API routes like NextAuth
  // output: "export", 
  images: {
    unoptimized: true,
  },
  // Add experimental features for App Router with NextAuth
  experimental: {
    serverComponentsExternalPackages: ["next-auth"],
  },
};

export default nextConfig;