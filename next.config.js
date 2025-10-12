/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true,

  // 🔐 Matikan source map di browser untuk keamanan
  productionBrowserSourceMaps: false,

  // 🧹 Hapus console.log di production
  compiler: {
    removeConsole: isProd,
  },

  // 🧱 Tambahkan header keamanan ke semua response
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // 🚫 Mencegah XSS
          { key: "X-XSS-Protection", value: "1; mode=block" },

          // 🚫 Mencegah content-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },

          // 🚫 Mencegah website ditampilkan dalam iframe (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },

          // 🌐 Kontrol informasi referer
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // 🎯 Batasi akses hardware browser
          {
            key: "Permissions-Policy",
            value: "geolocation=(self), camera=(), microphone=(), interest-cohort=(), fullscreen=(self)",
          },


          // 🧱 Paksa HTTPS untuk semua subdomain
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // 🛡️ Content Security Policy (CSP)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval';", // Next.js perlu unsafe-inline untuk HMR di dev
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' data: blob: https:;",
              "font-src 'self' data:;",
              "object-src 'none';",
              "frame-ancestors 'none';",
              "base-uri 'self';",
              "form-action 'self';",
            ].join(" "),
          },
        ],
      },
    ];
  },

  // ⚙️ Opsional: redirect otomatis ke HTTPS di production
  async redirects() {
    if (!isProd) return [];
    return [
      {
        source: "/(.*)",
        has: [{ type: "host", value: "^(?!localhost).*" }],
        permanent: true,
        destination: "https://localhost:3000/:path*",
      },
    ];
  },
};

export default nextConfig;
