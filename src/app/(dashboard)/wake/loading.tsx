export default function WakeLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-9 w-44 rounded-lg bg-ember-surface-raised" />
      <div className="mt-2 h-5 w-80 rounded-lg bg-ember-surface-raised" />

      {/* Category checkboxes skeleton */}
      <div className="mt-8 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-ember-border-subtle bg-ember-surface p-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded bg-ember-surface-raised" />
              <div className="h-4 w-24 rounded bg-ember-surface-raised" />
            </div>
            <div className="h-3 w-16 rounded bg-ember-surface-raised" />
          </div>
        ))}
      </div>

      {/* Budget display skeleton */}
      <div className="mt-6 h-12 rounded-xl bg-ember-surface-raised" />

      {/* Button skeleton */}
      <div className="mt-6 h-12 rounded-xl bg-ember-surface-raised" />
    </div>
  );
}
