import { generatePassportNarrative, buildPassportData } from "@/lib/ai/passportGenerator";
import { createPassport } from "@/lib/arkiv/entities";

export async function POST(req: Request) {
  const { wallet, platformWallet } = await req.json();
  if (!wallet || !platformWallet) {
    return Response.json({ error: "wallet and platformWallet required" }, { status: 400 });
  }

  try {
    const [narrative, passportData] = await Promise.all([
      generatePassportNarrative(wallet),
      buildPassportData(wallet),
    ]);

    passportData.payload.aiNarrative = narrative;
    const pWallet = (process.env.PULSE_PLATFORM_PRIVATE_KEY
      ? platformWallet
      : wallet) as `0x${string}`;

    const result = await createPassport(pWallet, wallet as `0x${string}`, passportData);
    return Response.json({ entityKey: result.entityKey, txHash: result.txHash });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Generation failed" }, { status: 500 });
  }
}
