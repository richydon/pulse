"use client";

import { AppShell } from "@/components/layout/AppShell";
import { usePulseAuth } from "@/hooks/usePulseAuth";
import { Settings, Wallet, Bell, Shield, LogOut, Copy, Check, ExternalLink } from "lucide-react";
import { BRAGA_EXPLORER_URL, CURRENT_COHORT } from "@/lib/arkiv/constants";
import { useState } from "react";
import { truncateHex } from "@/lib/utils/format";

export default function SettingsPage() {
  const { authenticated, address, logout, login } = usePulseAuth();
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!authenticated) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <Settings className="w-10 h-10 text-[#9CA3AF] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#111827] mb-2">Settings</h1>
          <p className="text-sm text-[#6B7280] mb-6">Connect your wallet to manage your Pulse settings.</p>
          <button onClick={() => login()} className="btn-ns px-6 py-2.5">Connect Wallet</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Settings</h1>
          <p className="text-sm text-[#6B7280] mt-1">Manage your Pulse account and preferences</p>
        </div>

        {/* Wallet Section */}
        <section className="card-ns p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#6B7280]" />
            <h2 className="text-sm font-semibold text-[#111827]">Connected Wallet</h2>
          </div>

          <div className="bg-[#F8F9FA] rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#9CA3AF] mb-1">Wallet Address</p>
              <p className="text-sm font-mono text-[#111827]">{address}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyAddress}
                className="p-2 rounded-lg hover:bg-[#E5E7EB] transition-colors"
                title="Copy address"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[#10B981]" />
                ) : (
                  <Copy className="w-4 h-4 text-[#6B7280]" />
                )}
              </button>
              <a
                href={`${BRAGA_EXPLORER_URL}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-[#E5E7EB] transition-colors"
                title="View on explorer"
              >
                <ExternalLink className="w-4 h-4 text-[#6B7280]" />
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-[#F3F4F6]">
            <div>
              <p className="text-sm font-medium text-[#111827]">Current Cohort</p>
              <p className="text-xs text-[#9CA3AF]">{CURRENT_COHORT}</p>
            </div>
            <span className="text-xs bg-[#ECFDF5] text-[#059669] border border-[#86EFAC] px-2.5 py-1 rounded-full font-medium">
              Active
            </span>
          </div>

          <div className="pt-2">
            <a href={`/profile/${address}`} className="btn-ns-outline text-sm px-4 py-2 inline-flex items-center gap-2">
              View Public Profile
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* Notifications — placeholder */}
        <section className="card-ns p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#6B7280]" />
            <h2 className="text-sm font-semibold text-[#111827]">Notifications</h2>
          </div>
          {[
            { label: "Contribution validated", desc: "When your contribution gets 2 peer approvals", defaultOn: true },
            { label: "New endorsement received", desc: "When someone endorses a skill of yours", defaultOn: true },
            { label: "Streak at risk", desc: "Daily reminder if you haven't checked in", defaultOn: true },
            { label: "Bounty deadline approaching", desc: "48 hours before a bounty expires", defaultOn: false },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
              <div>
                <p className="text-sm text-[#111827]">{n.label}</p>
                <p className="text-xs text-[#9CA3AF]">{n.desc}</p>
              </div>
              <div
                className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${
                  n.defaultOn ? "bg-[#111827]" : "bg-[#E5E7EB]"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform shadow-sm ${
                    n.defaultOn ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
            </div>
          ))}
          <p className="text-xs text-[#9CA3AF]">Notification settings coming soon — will be stored on-chain.</p>
        </section>

        {/* Privacy & Data */}
        <section className="card-ns p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#6B7280]" />
            <h2 className="text-sm font-semibold text-[#111827]">Privacy & Data</h2>
          </div>
          <div className="space-y-3">
            <div className="bg-[#F8F9FA] rounded-lg p-4">
              <p className="text-sm font-medium text-[#111827] mb-1">Data Ownership</p>
              <p className="text-xs text-[#6B7280]">
                All your contributions, endorsements, and reputation data are stored on Arkiv Braga
                testnet. You own your entities — only your wallet can update them. Pulse has no
                access to your private keys.
              </p>
            </div>
            <div className="bg-[#F8F9FA] rounded-lg p-4">
              <p className="text-sm font-medium text-[#111827] mb-1">Public Profile</p>
              <p className="text-xs text-[#6B7280]">
                Your profile at <code className="font-mono bg-[#E5E7EB] px-1 rounded">/profile/{truncateHex(address ?? "", 8)}</code> is
                publicly visible. Reputation data is intentionally transparent — that&apos;s what
                makes it credible.
              </p>
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section className="card-ns p-5 border-[#FCA5A5] bg-[#FFF5F5]">
          <div className="flex items-center gap-2 mb-4">
            <LogOut className="w-4 h-4 text-[#EF4444]" />
            <h2 className="text-sm font-semibold text-[#991B1B]">Disconnect</h2>
          </div>
          <p className="text-xs text-[#991B1B] mb-4">
            Disconnecting removes your session from this device. Your on-chain data is safe — it
            lives on Arkiv and is always accessible with your wallet.
          </p>
          <button
            onClick={() => logout()}
            className="text-sm text-[#EF4444] border border-[#FCA5A5] rounded-full px-4 py-2 hover:bg-[#FEE2E2] transition-colors"
          >
            Disconnect Wallet
          </button>
        </section>
      </div>
    </AppShell>
  );
}
