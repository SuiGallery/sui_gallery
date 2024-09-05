/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.windows.net',
            },
        ],
    },
};

export default nextConfig;
