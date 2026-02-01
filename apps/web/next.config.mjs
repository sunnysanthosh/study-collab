import { fileURLToPath } from "url";
import path from "path";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const api = new URL(apiUrl);

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: api.protocol.replace(":", ""),
        hostname: api.hostname,
        port: api.port || "",
        pathname: "/api/files/**",
      },
    ],
  },
};

export default nextConfig;
