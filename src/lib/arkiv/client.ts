"use client";

import { createPublicClient, createWalletClient, http } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";
import { BRAGA_RPC_URL } from "./constants";

export function getPublicClient() {
  return createPublicClient({
    chain: braga,
    transport: http(BRAGA_RPC_URL),
  });
}

export function getWalletClient(account: `0x${string}`) {
  return createWalletClient({
    chain: braga,
    transport: http(BRAGA_RPC_URL),
    account,
  });
}
