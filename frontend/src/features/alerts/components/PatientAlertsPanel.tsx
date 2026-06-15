import { useState, useMemo, useCallback } from 'react'
import { Plus, AlertCircle, ClipboardList } from 'lucide-react'
import { usePatientAlertsQuery } from '../api/usePatientAlertsApi'
import { SEVERITY_PRIORITY_MAP } from '../constants/alerts.constants'
import AlertCard from './AlertCard'
import AlertForm from './AlertForm'
import AlertsLoadingSkeleton from './AlertsLoadingSkeleton'
import { ALERT_MESSAGES } from '../../../constants/messages'

interface PatientAlertsPanelProps {
  patientId: string
}

export default function PatientAlertsPanel({ patientId }: PatientAlertsPanelProps) {
  const [isFormVisible, setIsFormVisible] = useState(false)
  const { data: patientAlertsList, isLoading, isError, error, refetch } = usePatientAlertsQuery(patientId)

  const handleOpenForm = useCallback(() => setIsFormVisible(true), [])
  const handleRetry = useCallback(() => refetch(), [refetch])

  const sortedPatientAlerts = useMemo(() => {
    if (!patientAlertsList) return []
    return [...patientAlertsList].sort((a, b) => {
      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1
      }
      return SEVERITY_PRIORITY_MAP[a.severity] - SEVERITY_PRIORITY_MAP[b.severity]
    })
  }, [patientAlertsList])

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="flex items-center justify-between rounded-t-xl bg-primary px-6 py-4">
        <h2 className="text-base font-bold text-white">{ALERT_MESSAGES.panelTitle}</h2>
        <button
          onClick={handleOpenForm}
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          <Plus className="h-4 w-4" />
          {ALERT_MESSAGES.newAlert}
        </button>
      </div>

      <div className="bg-white p-6">
        {isLoading && <AlertsLoadingSkeleton />}

        {isError && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 py-8 text-center" role="alert">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <p className="text-sm font-semibold text-red-800">{ALERT_MESSAGES.errorTitle}</p>
            <p className="text-xs text-red-600">
              {error instanceof Error ? error.message : ALERT_MESSAGES.errorFallback}
            </p>
            <button
              onClick={handleRetry}
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              {ALERT_MESSAGES.actions.retry}
            </button>
          </div>
        )}

        {!isLoading && !isError && sortedPatientAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-surface py-12 text-center">
            <ClipboardList className="h-8 w-8 text-slate-400" />
            <p className="text-sm font-semibold text-slate-600">{ALERT_MESSAGES.emptyTitle}</p>
            <p className="text-xs text-slate-500">
              {ALERT_MESSAGES.emptyHint}
            </p>
          </div>
        )}

        {!isLoading && !isError && sortedPatientAlerts.length > 0 && (
          <div className="flex flex-col divide-y divide-slate-200">
            {sortedPatientAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </div>

      {isFormVisible && (
        <AlertForm patientId={patientId} onClose={() => setIsFormVisible(false)} />
      )}
    </div>
  )
}
