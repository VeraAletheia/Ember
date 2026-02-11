export default function SettingsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-9 w-32 rounded-lg bg-ember-surface-raised" />
      <div className="mt-2 h-5 w-64 rounded-lg bg-ember-surface-raised" />

      <div className="mt-8 space-y-8">
        {/* Account section skeleton */}
        <div>
          <div className="h-6 w-24 rounded bg-ember-surface-raised" />
          <div className="mt-4 rounded-2xl border border-ember-border-subtle bg-ember-surface p-5">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 rounded bg-ember-surface-raised" />
                  <div className="h-4 w-32 rounded bg-ember-surface-raised" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* API Tokens section skeleton */}
        <div>
          <div className="h-6 w-28 rounded bg-ember-surface-raised" />
          <div className="mt-1 h-4 w-80 rounded bg-ember-surface-raised" />
          <div className="mt-4 h-32 rounded-2xl bg-ember-surface-raised" />
        </div>
      </div>
    </div>
  );
}
