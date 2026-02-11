"use client";

import { Flame } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="rounded-full bg-ember-error/10 p-4">
        <Flame className="h-12 w-12 text-ember-error" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold text-ember-text">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-ember-text-secondary">
        {error.message || "An unexpected error occurred. We're looking into it."}
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-ember-text-muted">
          Error ID: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="mt-8 rounded-xl bg-ember-amber-600 px-6 py-3 font-semibold text-ember-bg shadow-ember-glow transition-all hover:bg-ember-amber hover:shadow-ember-glow-lg"
      >
        Try Again
      </button>
    </main>
  );
}
