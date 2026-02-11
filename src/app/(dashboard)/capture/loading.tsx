export default function CaptureLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-9 w-32 rounded-lg bg-ember-surface-raised" />
      <div className="mt-2 h-5 w-80 rounded-lg bg-ember-surface-raised" />

      {/* Mode tabs skeleton */}
      <div className="mt-8 flex rounded-xl border border-ember-border-subtle bg-ember-surface p-1">
        <div className="flex-1 rounded-lg bg-ember-surface-raised py-5" />
        <div className="flex-1 rounded-lg py-5" />
      </div>

      {/* Textarea skeleton */}
      <div className="mt-6 h-64 rounded-2xl bg-ember-surface-raised" />

      {/* Button skeleton */}
      <div className="mt-4 h-12 rounded-xl bg-ember-surface-raised" />
    </div>
  );
}
