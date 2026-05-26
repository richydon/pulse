"use client";

import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { usePulseAuth } from "@/hooks/usePulseAuth";
import { Send, Bot, User, ExternalLink } from "lucide-react";
import { BRAGA_EXPLORER_URL } from "@/lib/arkiv/constants";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Write my reputation summary for a VC pitch",
  "What is my strongest skill based on endorsements?",
  "How do I rank in the Earn pillar?",
  "Generate a one-paragraph bio for LinkedIn",
  "Which contributions earned me the most points?",
  "What gaps do I have in my reputation?",
];

function extractEntityKeys(text: string): string[] {
  const matches = text.match(/0x[a-fA-F0-9]{40,}/g);
  return [...new Set(matches ?? [])];
}

let msgId = 0;
function nextId() {
  return `msg-${++msgId}`;
}

export default function AIPage() {
  const { authenticated, address, login } = usePulseAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenKey, setRegenKey] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function regeneratePassport() {
    if (!address) return;
    setRegenerating(true);
    try {
      const res = await fetch("/api/passport/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, platformWallet: address }),
      });
      const data = await res.json();
      if (data.entityKey) setRegenKey(data.entityKey);
    } catch (e) {
      console.error(e);
    } finally {
      setRegenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading || !address) return;

    const userMsg: ChatMessage = { id: nextId(), role: "user", content: input };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    const assistantId = nextId();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Strip SSE data: prefix if present
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const text = line.startsWith("data: ") ? line.slice(6) : line;
          if (text && text !== "[DONE]") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + text } : m
              )
            );
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, something went wrong. Please try again." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (!authenticated) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <Bot className="w-10 h-10 text-[#9CA3AF] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#111827] mb-2">AI Reputation Agent</h1>
          <p className="text-sm text-[#6B7280] mb-6">
            Connect your wallet to chat with Claude about your on-chain reputation.
          </p>
          <button onClick={() => login()} className="btn-ns px-6 py-2.5">Connect Wallet</button>
        </div>
      </AppShell>
    );
  }

  const allEntityKeys = messages
    .filter((m) => m.role === "assistant")
    .flatMap((m) => extractEntityKeys(m.content));

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Chat window */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-[#111827]">AI Reputation Agent</h1>
              <p className="text-xs text-[#9CA3AF]">
                Powered by Claude · reading your Arkiv data
              </p>
            </div>
            <button
              onClick={regeneratePassport}
              disabled={regenerating}
              className="btn-ns-outline text-xs px-3 py-1.5"
            >
              {regenerating ? "Regenerating..." : "Regenerate Passport"}
            </button>
          </div>

          {regenKey && (
            <div className="mx-6 mt-3 rounded-lg bg-[#D1FAE5] border border-[#6EE7B7] p-3 text-xs text-[#059669]">
              Passport updated on Arkiv:{" "}
              <span className="font-mono">{regenKey.slice(0, 16)}...</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="w-5 h-5 text-[#2563EB]" />
                  <p className="text-sm text-[#6B7280]">
                    Hi! I can read your complete on-chain reputation from Arkiv and help you tell your story. Try one of these:
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="text-left text-xs text-[#6B7280] border border-[#E5E7EB] rounded-lg p-2.5 hover:border-[#9CA3AF] hover:bg-[#F8F9FA] transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    m.role === "user" ? "bg-[#111827]" : "bg-[#EFF6FF]"
                  }`}
                >
                  {m.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-[#2563EB]" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                    m.role === "user"
                      ? "bg-[#111827] text-white"
                      : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#111827]"
                  }`}
                >
                  {m.content ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  ) : (
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-[#E5E7EB] px-6 py-4 flex gap-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your reputation..."
              className="flex-1 border border-[#E5E7EB] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#111827]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="btn-ns w-10 h-10 p-0 rounded-full flex items-center justify-center"
              style={(!input.trim()) ? { opacity: 0.4 } : {}}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Context panel */}
        <div className="w-64 shrink-0 border-l border-[#E5E7EB] bg-[#F8F9FA] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E5E7EB]">
            <p className="text-xs font-semibold text-[#111827]">Entity Citations</p>
            <p className="text-xs text-[#9CA3AF]">Keys referenced in this chat</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {allEntityKeys.length === 0 ? (
              <p className="text-xs text-[#9CA3AF]">
                Entity keys will appear here as the AI cites your Arkiv records.
              </p>
            ) : (
              allEntityKeys.map((key) => (
                <a
                  key={key}
                  href={`${BRAGA_EXPLORER_URL}/entity/${key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-mono text-[#0D9488] bg-[#F0FDFA] border border-[#CCFBF1] rounded-lg px-2 py-1.5 hover:bg-[#CCFBF1] transition-colors"
                >
                  <span className="truncate">{key.slice(0, 14)}...</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
