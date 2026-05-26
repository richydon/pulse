"use client";

import { createPublicClient, createWalletClient, http, custom } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";
import type { ConnectedWallet } from "@privy-io/react-auth";
import { BRAGA_CHAIN_ID, BRAGA_RPC_URL } from "./constants";

export function getPublicClient() {
  return createPublicClient({
    chain: braga,
    transport: http(BRAGA_RPC_URL),
  });
}

export async function getPrivyWalletClient(wallet: ConnectedWallet) {
  await wallet.switchChain(BRAGA_CHAIN_ID);
  const provider = await wallet.getEthereumProvider();
  return createWalletClient({ chain: braga, transport: custom(provider) });
}
