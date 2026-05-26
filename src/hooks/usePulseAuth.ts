"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useMemo } from "react";

export function usePulseAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();

  const wallet = useMemo(() => {
    if (!wallets.length) return null;
    return wallets[0];
  }, [wallets]);

  const address = wallet?.address as `0x${string}` | undefined;

  async function getWalletClient() {
    if (!wallet) throw new Error("No wallet connected");
    const provider = await wallet.getEthereumProvider();
    return provider;
  }

  return {
    ready,
    authenticated,
    user,
    address,
    wallet,
    login,
    logout,
    getWalletClient,
    isConnected: authenticated && !!address,
  };
}
