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
  // Ensure the embedded wallet is on the Arkiv Braga chain.
  // Wrap in try/catch — some Privy wallet types reject switchChain when
  // they are already on the correct chain or don't support the method.
  try {
    await wallet.switchChain(BRAGA_CHAIN_ID);
  } catch {
    // Proceed: Privy is configured with braga as defaultChain so the
    // provider should already be pointing at the right network.
  }
  const provider = await wallet.getEthereumProvider();

  // account MUST be supplied — the Arkiv SDK checks `client.account` before
  // every sendTransaction call and throws "Account required" if it is absent.
  return createWalletClient({
    chain: braga,
    transport: custom(provider),
    account: wallet.address as `0x${string}`,
  });
}
