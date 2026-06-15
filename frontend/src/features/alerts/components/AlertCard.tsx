import { useState, useCallback } from 'react'
import { Pencil, Trash2, Check } from 'lucide-react'
import { type PatientAlert } from '../types'
import {
  SEVERITY_STYLE_MAP,
  INACTIVE_ALERT_STYLES,
  ALERT_TYPE_LABEL_MAP,
  SEVERITY_LABEL_MAP,
} from '../constants/alerts.constants'
import { useUpdatePatientAlertMutation, useDeletePatientAlertMutation } from '../api/usePatientAlertsApi'
import AlertForm from './AlertForm'
import { ALERT_MESSAGES } from '../../../constants/messages'

interface AlertCardProps {
  alert: PatientAlert
}

export default function AlertCard({ alert }: AlertCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const toggleMutation = useUpdatePatientAlertMutation(alert.patientId)
  const deleteMutation = useDeletePatientAlertMutation(alert.patientId)

  const cardStyles = alert.isActive
    ? SEVERITY_STYLE_MAP[alert.severity]
    : INACTIVE_ALERT_STYLES

  const handleAlertStateToggle = useCallback(() => {
    toggleMutation.mutate({
      alertId: alert.id,
      payload: { isActive: !alert.isActive },
    })
  }, [toggleMutation, alert.id, alert.isActive])

  const handleAlertDeletion = useCallback(() => {
    if (confirm(ALERT_MESSAGES.confirmDelete)) {
      deleteMutation.mutate(alert.id)
    }
  }, [deleteMutation, alert.id])

  const handleEditClick = useCallback(() => setIsEditing(true), [])

  return (
    <>
      <div className={`flex items-center justify-between gap-4 p-4 transition-all ${cardStyles}`}>
        <div className="flex flex-1 items-start gap-3">
          {alert.isActive && (
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          )}
          {!alert.isActive && (
            <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border border-slate-300" aria-hidden="true" />
          )}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
                {SEVERITY_LABEL_MAP[alert.severity]}
              </span>
              <span className="text-xs font-medium text-slate-600">
                {ALERT_TYPE_LABEL_MAP[alert.type]}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-800">{alert.message}</p>
            <p className="text-xs text-slate-500">
              {alert.isActive ? ALERT_MESSAGES.status.active : ALERT_MESSAGES.status.inactive}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAlertStateToggle}
            type="button"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              alert.isActive ? 'bg-primary' : 'bg-slate-300'
            }`}
            aria-pressed={alert.isActive}
            aria-label={alert.isActive ? ALERT_MESSAGES.actions.deactivate : ALERT_MESSAGES.actions.activate}
            title={alert.isActive ? ALERT_MESSAGES.actions.deactivate : ALERT_MESSAGES.actions.activate}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                alert.isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>

          <button
            onClick={handleEditClick}
            type="button"
            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            title={ALERT_MESSAGES.actions.edit}
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            onClick={handleAlertDeletion}
            type="button"
            className="rounded-md p-1.5 text-slate-600 hover:bg-red-50 hover:text-red-700"
            title={ALERT_MESSAGES.actions.delete}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isEditing && (
        <AlertForm
          patientId={alert.patientId}
          alert={alert}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  )
}
