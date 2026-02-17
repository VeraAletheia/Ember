"use client";

import { useState, useTransition } from "react";
import { Flame, ExternalLink, Check, Copy } from "lucide-react";
import { generateWakePromptAction } from "@/lib/actions/wake-prompts";
import type { MemoryCategory } from "@/lib/db/schema";

const AI_PLATFORMS = [
  {
    name: "ChatGPT",
    url: "https://chatgpt.com/",
    icon: "🤖",
  },
  {
    name: "Claude",
    url: "https://claude.ai/new",
    icon: "🧠",
  },
  {
    name: "Gemini",
    url: "https://gemini.google.com/app",
    icon: "✨",
  },
  {
    name: "Character.AI",
    url: "https://character.ai/",
    icon: "🎭",
  },
];

export function QuickKindle({
  profileId,
  tokenBudget,
  hasMemories,
}: {
  profileId: string;
  tokenBudget: number;
  hasMemories: boolean;
}) {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!hasMemories) return null;

  async function handleKindle() {
    setError(null);
    startTransition(async () => {
      const allCategories: MemoryCategory[] = [
        "emotional",
        "work",
        "hobbies",
        "relationships",
        "preferences",
      ];
      const res = await generateWakePromptAction({
        profileId,
        categories: allCategories,
        budget: tokenBudget,
      });

      if (res.status === "error") {
        setError(res.error);
        return;
      }

      setPrompt(res.data.prompt);
      // Auto-copy to clipboard
      try {
        await navigator.clipboard.writeText(res.data.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch {
        // Clipboard API might not be available
      }
    });
  }

  async function handleCopy() {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!prompt) {
    return (
      <button
        onClick={handleKindle}
        disabled={isPending}
        className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-ember-amber/20 bg-gradient-to-r from-ember-amber-700/10 to-ember-amber-600/10 px-6 py-4 font-semibold text-ember-amber transition-all duration-300 hover:border-ember-amber/40 hover:shadow-ember-glow active:scale-[0.99] disabled:opacity-50"
      >
        <Flame className="h-5 w-5 transition-transform group-hover:scale-110" />
        {isPending ? "Kindling..." : "⚡ Quick Kindle — Copy & Go"}
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-ember-amber/20 bg-ember-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ember-amber">
          {copied ? (
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4" /> Copied to clipboard!
            </span>
          ) : (
            "🔥 Kindle prompt ready"
          )}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-lg border border-ember-border px-3 py-1 text-xs text-ember-text-secondary transition-colors hover:border-ember-amber/30 hover:text-ember-text"
        >
          <Copy className="h-3 w-3" />
          Copy again
        </button>
      </div>

      <p className="text-xs text-ember-text-muted">
        Paste into any AI chat to kindle the flame:
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {AI_PLATFORMS.map((platform) => (
          <a
            key={platform.name}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-ember-border-subtle bg-ember-surface-raised px-3 py-2.5 text-sm text-ember-text-secondary transition-all hover:border-ember-amber/30 hover:text-ember-text"
          >
            <span>{platform.icon}</span>
            {platform.name}
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
        ))}
      </div>

      {error && (
        <p className="text-xs text-ember-error">{error}</p>
      )}
    </div>
  );
}
