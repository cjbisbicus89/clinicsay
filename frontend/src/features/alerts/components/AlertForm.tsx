import { useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { AlertType, Severity, type PatientAlert } from '../types'
import { ALERT_TYPE_OPTIONS, SEVERITY_OPTIONS } from '../constants/alerts.constants'
import {
  useCreatePatientAlertMutation,
  useUpdatePatientAlertMutation,
  isApiError,
} from '../api/usePatientAlertsApi'
import { ALERT_MESSAGES } from '../../../constants/messages'

const MESSAGE_TEXTAREA_ROWS = 3

const alertFormSchema = z.object({
  type: z.nativeEnum(AlertType),
  severity: z.nativeEnum(Severity),
  message: z.string().min(3, ALERT_MESSAGES.validation.messageMin).max(500, ALERT_MESSAGES.validation.messageMax),
  isActive: z.boolean(),
})

type AlertFormSchema = z.infer<typeof alertFormSchema>

interface AlertFormProps {
  patientId: string
  alert?: PatientAlert
  onClose: () => void
}

export default function AlertForm({ patientId, alert, onClose }: AlertFormProps) {
  const isEditingMode = !!alert
  const checkboxId = alert ? `isActive-${alert.id}` : 'isActive-new'
  const createAlertMutation = useCreatePatientAlertMutation(patientId)
  const updateAlertMutation = useUpdatePatientAlertMutation(patientId)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AlertFormSchema>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      type: alert?.type ?? AlertType.ALLERGY,
      severity: alert?.severity ?? Severity.MEDIUM,
      message: alert?.message ?? '',
      isActive: alert?.isActive ?? true,
    },
  })

  const handleMutationError = useCallback(
    (err: unknown) => {
      if (isApiError(err) && err.response?.status === 409 && err.response?.data?.detail) {
        setError('message', { type: 'manual', message: err.response.data.detail })
      } else if (err instanceof Error) {
        setError('message', { type: 'manual', message: err.message })
      }
    },
    [setError],
  )

  const onAlertFormSubmit = (formValues: AlertFormSchema) => {
    if (isEditingMode && alert) {
      updateAlertMutation.mutate(
        { alertId: alert.id, payload: formValues },
        { onSuccess: onClose, onError: handleMutationError },
      )
    } else {
      createAlertMutation.mutate(formValues, { onSuccess: onClose, onError: handleMutationError })
    }
  }

  const activeMutation = isEditingMode ? updateAlertMutation : createAlertMutation

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="alert-form-title">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="alert-form-title" className="text-lg font-semibold text-slate-900">
            {isEditingMode ? ALERT_MESSAGES.form.editTitle : ALERT_MESSAGES.form.newTitle}
          </h2>
          <button
            onClick={onClose}
            type="button"
            aria-label={ALERT_MESSAGES.actions.close}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onAlertFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="alert-type" className="mb-1 block text-sm font-medium text-slate-700">{ALERT_MESSAGES.form.typeLabel}</label>
            <select
              id="alert-type"
              {...register('type')}
              aria-invalid={!!errors.type}
              aria-describedby={errors.type ? 'alert-type-error' : undefined}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {ALERT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p id="alert-type-error" className="mt-1 text-xs text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="alert-severity" className="mb-1 block text-sm font-medium text-slate-700">{ALERT_MESSAGES.form.severityLabel}</label>
            <select
              id="alert-severity"
              {...register('severity')}
              aria-invalid={!!errors.severity}
              aria-describedby={errors.severity ? 'alert-severity-error' : undefined}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {SEVERITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.severity && (
              <p id="alert-severity-error" className="mt-1 text-xs text-red-600">{errors.severity.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="alert-message" className="mb-1 block text-sm font-medium text-slate-700">{ALERT_MESSAGES.form.messageLabel}</label>
            <textarea
              id="alert-message"
              {...register('message')}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'alert-message-error' : undefined}
              rows={MESSAGE_TEXTAREA_ROWS}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.message && (
              <p id="alert-message-error" className="mt-1 text-xs text-red-600">{errors.message.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('isActive')}
              id={checkboxId}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <label htmlFor={checkboxId} className="text-sm text-slate-700">
              {ALERT_MESSAGES.form.isActiveLabel}
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {ALERT_MESSAGES.actions.cancel}
            </button>
            <button
              type="submit"
              disabled={activeMutation.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {activeMutation.isPending
                ? ALERT_MESSAGES.actions.saving
                : isEditingMode
                  ? ALERT_MESSAGES.actions.save
                  : ALERT_MESSAGES.actions.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
