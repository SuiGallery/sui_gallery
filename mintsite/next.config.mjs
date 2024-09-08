/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.windows.net',
            },
        ],
    },
    env: {
        NEXT_PUBLIC_USE_FAKE_API: process.env.NEXT_PUBLIC_USE_FAKE_API,
        NEXT_PUBLIC_PACKAGE_ID: process.env.NEXT_PUBLIC_PACKAGE_ID,
        NEXT_PUBLIC_GALLERY_SHARED_ID: process.env.NEXT_PUBLIC_GALLERY_SHARED_ID,
        DALLE_API_KEY: process.env.DALLE_API_KEY,
        NEXT_PUBLIC_SUI_NETWORK: process.env.NEXT_PUBLIC_SUI_NETWORK,
    },
};

export default nextConfig;
