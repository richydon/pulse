"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { braga } from "@arkiv-network/sdk/chains";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <QueryClientProvider client={queryClient}>
      {mounted ? (
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "placeholder-privy-app-id"}
          config={{
            loginMethods: ["email", "wallet"],
            appearance: {
              theme: "light",
              accentColor: "#000000",
              logo: "/pulse-logo.svg",
            },
            defaultChain: braga,
            supportedChains: [braga],
            embeddedWallets: {
              ethereum: { createOnLogin: "users-without-wallets" },
            },
          }}
        >
          {children}
        </PrivyProvider>
      ) : (
        <>{children}</>
      )}
    </QueryClientProvider>
  );
}
