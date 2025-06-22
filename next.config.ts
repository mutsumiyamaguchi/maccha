import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NODE_TLS_REJECT_UNAUTHORIZED: '0'
  }
};

export default nextConfig;
