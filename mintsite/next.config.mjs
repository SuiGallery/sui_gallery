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
        NEXT_PUBLIC_PACKAGE_ID: process.env.NEXT_PUBLIC_PACKAGE_ID,
        NEXT_PUBLIC_GALLERY_SHARED_ID: process.env.NEXT_PUBLIC_GALLERY_SHARED_ID,
        NEXT_PUBLIC_SUI_NETWORK: process.env.NEXT_PUBLIC_SUI_NETWORK,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
