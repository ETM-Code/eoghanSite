/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: "/2048-in-react",
    output: "export",  // <=== enables static exports
    reactStrictMode: true,
    images: {
        unoptimized: true,
      },
    basePath: '/eoghanSite', // Replace 'eoghanSite' with your repository name or subdirectory
    assetPrefix: '.', // Same as basePath
};

export default nextConfig;
