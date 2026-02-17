import Link from "next/link";
import { Flame } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Flame className="h-16 w-16 text-ember-amber/30" />
      <h1 className="mt-6 font-display text-4xl font-bold text-ember-text">
        404
      </h1>
      <p className="mt-3 text-lg text-ember-text-secondary">
        This ember has gone cold. Nothing here.
      </p>
      <Link
        href="/memories"
        className="mt-8 rounded-xl bg-ember-amber-600 px-6 py-3 font-semibold text-ember-bg shadow-ember-glow transition-all hover:bg-ember-amber hover:shadow-ember-glow-lg"
      >
        Back to your Embers
      </Link>
    </main>
  );
}
