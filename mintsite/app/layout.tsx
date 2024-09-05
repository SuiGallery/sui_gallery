'use client'
import "./globals.css";
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";
import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mysten/dapp-kit/dist/index.css";
import '@radix-ui/themes/styles.css';



const { networkConfig } = createNetworkConfig({
  rpc: { url: process.env.NEXT_PUBLIC_SUI_NETWORK! },
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Theme appearance="light" accentColor="orange" radius="full">
          <QueryClientProvider client={queryClient}>
            <SuiClientProvider networks={networkConfig} defaultNetwork="rpc">
              <WalletProvider autoConnect>{children}</WalletProvider>
            </SuiClientProvider>
          </QueryClientProvider>
        </Theme>
      </body>
    </html>
  );
}
