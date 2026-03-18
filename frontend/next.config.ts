import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // The frontend calls the FastAPI backend directly via NEXT_PUBLIC_BACKEND_URL
};

export default nextConfig;
