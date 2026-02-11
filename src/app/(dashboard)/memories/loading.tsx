export default function MemoriesLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-9 w-40 rounded-lg bg-ember-surface-raised" />
      <div className="mt-2 h-5 w-72 rounded-lg bg-ember-surface-raised" />

      {/* Search skeleton */}
      <div className="mt-8 h-10 rounded-xl bg-ember-surface-raised" />

      {/* Filter pills skeleton */}
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 rounded-full bg-ember-surface-raised"
          />
        ))}
      </div>

      {/* Memory cards skeleton */}
      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-ember-border-subtle bg-ember-surface p-5"
          >
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 rounded-full bg-ember-surface-raised" />
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-1.5 w-1.5 rounded-full bg-ember-surface-raised"
                  />
                ))}
              </div>
            </div>
            <div className="mt-3 h-4 w-full rounded bg-ember-surface-raised" />
            <div className="mt-2 h-4 w-3/4 rounded bg-ember-surface-raised" />
            <div className="mt-3 flex justify-between">
              <div className="h-3 w-20 rounded bg-ember-surface-raised" />
              <div className="h-3 w-16 rounded bg-ember-surface-raised" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
