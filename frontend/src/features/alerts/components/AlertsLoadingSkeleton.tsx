import { ALERT_MESSAGES } from '../../../constants/messages'

export default function AlertsLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-2" role="status" aria-label={ALERT_MESSAGES.loading}>
      {[1, 2, 3].map((skeletonIndex) => (
        <div
          key={skeletonIndex}
          className="animate-pulse rounded-lg border border-slate-200 bg-surface p-4"
        >
          <div className="mb-3 h-4 w-28 rounded bg-slate-200" />
          <div className="h-3 w-3/4 rounded bg-slate-200" />
        </div>
      ))}
      <span className="sr-only">{ALERT_MESSAGES.loadingSrOnly}</span>
    </div>
  )
}
