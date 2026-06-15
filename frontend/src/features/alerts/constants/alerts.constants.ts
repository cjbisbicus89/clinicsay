import { AlertType, Severity } from '../types'

export const SEVERITY_STYLE_MAP: Record<Severity, string> = {
  [Severity.HIGH]: 'bg-red-50 border-red-200 text-red-800',
  [Severity.MEDIUM]: 'bg-orange-50 border-orange-200 text-orange-800',
  [Severity.LOW]: 'bg-blue-50 border-blue-200 text-blue-800',
}

export const INACTIVE_ALERT_STYLES = 'opacity-60 grayscale bg-slate-50 border-slate-200 text-slate-500'

export const ALERT_TYPE_LABEL_MAP: Record<AlertType, string> = {
  [AlertType.ALLERGY]: 'Alergia',
  [AlertType.MEDICAL_RISK]: 'Riesgo médico',
  [AlertType.SPECIAL_CONDITION]: 'Condición especial',
  [AlertType.ADMINISTRATIVE]: 'Administrativa',
}

export const SEVERITY_PRIORITY_MAP: Record<Severity, number> = {
  [Severity.HIGH]: 0,
  [Severity.MEDIUM]: 1,
  [Severity.LOW]: 2,
}

export const ALERT_TYPE_OPTIONS: Array<{ value: AlertType; label: string }> = [
  { value: AlertType.ALLERGY, label: ALERT_TYPE_LABEL_MAP[AlertType.ALLERGY] },
  { value: AlertType.MEDICAL_RISK, label: ALERT_TYPE_LABEL_MAP[AlertType.MEDICAL_RISK] },
  { value: AlertType.SPECIAL_CONDITION, label: ALERT_TYPE_LABEL_MAP[AlertType.SPECIAL_CONDITION] },
  { value: AlertType.ADMINISTRATIVE, label: ALERT_TYPE_LABEL_MAP[AlertType.ADMINISTRATIVE] },
]

export const SEVERITY_LABEL_MAP: Record<Severity, string> = {
  [Severity.HIGH]: 'Alta',
  [Severity.MEDIUM]: 'Media',
  [Severity.LOW]: 'Baja',
}

export const SEVERITY_OPTIONS: Array<{ value: Severity; label: string }> = [
  { value: Severity.LOW, label: SEVERITY_LABEL_MAP[Severity.LOW] },
  { value: Severity.MEDIUM, label: SEVERITY_LABEL_MAP[Severity.MEDIUM] },
  { value: Severity.HIGH, label: SEVERITY_LABEL_MAP[Severity.HIGH] },
]
