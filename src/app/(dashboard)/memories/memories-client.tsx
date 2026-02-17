"use client";

import { useState, useEffect } from "react";
import { MemoryBrowser } from "@/components/memory-browser";
import { MemoryStats } from "@/components/memory-stats";
import { OnboardingWelcome } from "@/components/onboarding-welcome";
import { QuickKindle } from "@/components/quick-kindle";

interface MemoriesPageClientProps {
  memories: any[];
  totalCaptures: number;
  categoryCounts: Record<string, number>;
  recentCaptureDate: string | null;
  profileId?: string;
  tokenBudget?: number;
}

export function MemoriesPageClient({
  memories,
  totalCaptures,
  categoryCounts,
  recentCaptureDate,
  profileId,
  tokenBudget = 8000,
}: MemoriesPageClientProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding if no memories and hasn't been dismissed
    if (memories.length === 0) {
      const dismissed = localStorage.getItem("ember-onboarding-dismissed");
      if (!dismissed) {
        setShowOnboarding(true);
      }
    }
  }, [memories.length]);

  const handleDismiss = () => {
    setShowOnboarding(false);
    localStorage.setItem("ember-onboarding-dismissed", "true");
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ember-text">
        Your Embers
      </h1>
      <p className="mt-2 text-ember-text-secondary">
        The warmth you&apos;ve gathered — facts and feelings, organized by what
        matters.
      </p>

      {showOnboarding && (
        <div className="mt-6">
          <OnboardingWelcome onDismiss={handleDismiss} />
        </div>
      )}

      {memories.length > 0 && profileId && (
        <div className="mt-6">
          <QuickKindle
            profileId={profileId}
            tokenBudget={tokenBudget}
            hasMemories={memories.length > 0}
          />
        </div>
      )}

      {memories.length > 0 && (
        <div className="mt-6">
          <MemoryStats
            totalMemories={memories.length}
            totalCaptures={totalCaptures}
            categoryCounts={categoryCounts}
            recentCaptureDate={recentCaptureDate}
          />
        </div>
      )}

      <div className="mt-8">
        <MemoryBrowser initialMemories={memories} />
      </div>
    </div>
  );
}
