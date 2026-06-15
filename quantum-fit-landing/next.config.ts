import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, ".."),
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://quantum-fit-backend-production.up.railway.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;
