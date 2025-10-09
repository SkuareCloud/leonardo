import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: "standalone",
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    logging: false,
    // logging: {
    //   fetches: {
    //     fullUrl: true,
    //     hmrRefreshes: true,
    //   },
    // },
    serverExternalPackages: ["pino"],
}

export default nextConfig
