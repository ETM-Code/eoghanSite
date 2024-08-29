/** @type {import('next').NextConfig} */

const nextConfig = {
    output: "export",  // enables static exports
    reactStrictMode: true,
    images: {
        unoptimized: true,
    },
    assetPrefix: process.env.NODE_ENV === 'production' ? '.' : '',
};

export default nextConfig;