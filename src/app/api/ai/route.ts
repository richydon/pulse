import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { buildMemberContext } from "@/lib/ai/contextBuilder";
import { buildSystemPrompt } from "@/lib/ai/systemPrompt";

export async function POST(req: Request) {
  const { messages, wallet } = await req.json();

  if (!wallet) {
    return Response.json({ error: "wallet required" }, { status: 400 });
  }

  const context = await buildMemberContext(wallet).catch(() => "No data available.");
  const systemPrompt = buildSystemPrompt(wallet, context);

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt,
    messages,
    maxOutputTokens: 1000,
  });

  return result.toTextStreamResponse();
}
