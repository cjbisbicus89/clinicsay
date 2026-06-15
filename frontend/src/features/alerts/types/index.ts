export enum AlertType {
  ALLERGY = 'ALLERGY',
  MEDICAL_RISK = 'MEDICAL_RISK',
  SPECIAL_CONDITION = 'SPECIAL_CONDITION',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface PatientAlert {
  id: string
  patientId: string
  type: AlertType
  severity: Severity
  message: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiError {
  type: string
  title: string
  status: number
  detail: string
  instance: string
}

export interface CreateAlertPayload {
  type: AlertType
  severity: Severity
  message: string
  isActive?: boolean
}

export interface UpdateAlertPayload {
  type?: AlertType
  severity?: Severity
  message?: string
  isActive?: boolean
}
