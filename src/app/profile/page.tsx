"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { usePulseAuth } from "@/hooks/usePulseAuth";
import { User } from "lucide-react";

export default function ProfileIndexPage() {
  const { ready, authenticated, address, login } = usePulseAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated && address) {
      router.replace(`/profile/${address}`);
    }
  }, [ready, authenticated, address, router]);

  // Privy still loading, or address resolving — avoid flash
  if (!ready || (authenticated && !address)) return null;

  // Not authenticated — show connect prompt
  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto mb-4">
          <User className="w-6 h-6 text-[#9CA3AF]" />
        </div>
        <h1 className="text-xl font-bold text-[#111827] mb-2">Your Profile</h1>
        <p className="text-sm text-[#6B7280] mb-6">
          Connect your wallet to view your reputation profile and contribution history.
        </p>
        <button onClick={() => login()} className="btn-ns px-6 py-2.5">
          Connect Wallet
        </button>
      </div>
    </AppShell>
  );
}
