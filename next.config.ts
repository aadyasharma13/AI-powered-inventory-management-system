import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App Router is enabled by default in Next.js 15
  // No additional configuration needed
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
