import { getFullnodeUrl } from "@mysten/sui.js/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
    testnet: {
        url: getFullnodeUrl("testnet"),
        variables: {
            suiGalleryPackageId: process.env.NEXT_PUBLIC_PACKAGE_ID,
            suiGallerySharedId: process.env.NEXT_PUBLIC_GALLERY_SHARED_ID,
        },
    }
});

export { useNetworkVariable, useNetworkVariables, networkConfig };