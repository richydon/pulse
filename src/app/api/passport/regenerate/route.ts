import { generatePassportNarrative, buildPassportData } from "@/lib/ai/passportGenerator";
import { createPassport } from "@/lib/arkiv/entities";
import { createWalletClient, http } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts";
import { BRAGA_RPC_URL } from "@/lib/arkiv/constants";

export async function POST(req: Request) {
  const { wallet } = await req.json();
  if (!wallet) {
    return Response.json({ error: "wallet required" }, { status: 400 });
  }

  const rawKey = process.env.PULSE_PLATFORM_PRIVATE_KEY;
  if (!rawKey) {
    return Response.json({ error: "PULSE_PLATFORM_PRIVATE_KEY not configured" }, { status: 500 });
  }

  try {
    const [narrative, passportData] = await Promise.all([
      generatePassportNarrative(wallet),
      buildPassportData(wallet),
    ]);

    passportData.payload.aiNarrative = narrative;

    const account = privateKeyToAccount(rawKey as `0x${string}`);
    const wc = createWalletClient({ chain: braga, transport: http(BRAGA_RPC_URL), account });

    const result = await createPassport(wc as any, wallet as `0x${string}`, passportData);
    return Response.json({ entityKey: result.entityKey, txHash: result.txHash });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Generation failed" }, { status: 500 });
  }
}
