import 'dotenv/config';

/** @type {import('next').NextConfig} */

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
    output: "export",  // enables static exports
    reactStrictMode: true,
    images: {
        unoptimized: true,
    },
    assetPrefix: isProduction ? 'https://eoghancollins.com' : '',
};

export default nextConfig;
