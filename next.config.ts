import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // `public/` is served with `max-age=0` by default. The globe imagery is
        // multi-megabyte and only changes if the files are replaced outright,
        // so it is worth caching hard.
        source: "/textures/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
