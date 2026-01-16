import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "localhost",
      // Add your S3 bucket domain here
      // e.g., "your-bucket.s3.amazonaws.com"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.s3.**.amazonaws.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-toast",
    ],
  },
  // Enable compression
  compress: true,
  // Optimize production builds
  swcMinify: true,
  // Enable React strict mode
  reactStrictMode: true,
  // Optimize font loading
  optimizeFonts: true,
  // Production source maps (disable in production for smaller builds)
  productionBrowserSourceMaps: false,
  // Output standalone for Docker deployments
  output: "standalone",
  // Headers configuration for CSP
  async headers() {
    const isDev = process.env.NODE_ENV === "development";
    
    // Build script-src directive - include unsafe-eval only in development
    const scriptSrc = [
      "'self'",
      "'unsafe-inline'",
      "https://*.clerk.com",
      "https://*.clerk.dev",
      "https://*.clerk.accounts.dev",
      "https://challenges.cloudflare.com",
      "https://vercel.live",
    ];
    
    if (isDev) {
      scriptSrc.push("'unsafe-eval'"); // Required for Next.js webpack in dev mode
    }
    
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src ${scriptSrc.join(" ")}`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://clerk-telemetry.com https://*.vercel.app https://*.vercel.com https://vitals.vercel-insights.com wss://*.clerk.com wss://*.clerk.accounts.dev",
              "worker-src 'self' blob:",
              "frame-src 'self' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://challenges.cloudflare.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              // Only upgrade insecure requests in production
              ...(isDev ? [] : ["upgrade-insecure-requests"]),
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
