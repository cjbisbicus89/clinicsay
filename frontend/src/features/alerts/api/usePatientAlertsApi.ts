import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import type {
  PatientAlert,
  ApiError,
  CreateAlertPayload,
  UpdateAlertPayload,
} from '../types'

const httpClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

const PATIENT_ALERTS_QUERY_KEY = 'patient-alerts'

export function isApiError(err: unknown): err is AxiosError<ApiError> {
  return axios.isAxiosError(err) && typeof err.response?.data?.status === 'number'
}

export async function fetchPatientAlerts(patientId: string): Promise<PatientAlert[]> {
  const response = await httpClient.get<PatientAlert[]>(`/patients/${patientId}/alerts`)
  return response.data
}

export async function createPatientAlert(
  patientId: string,
  payload: CreateAlertPayload
): Promise<PatientAlert> {
  const response = await httpClient.post<PatientAlert>(`/patients/${patientId}/alerts`, payload)
  return response.data
}

export async function updatePatientAlert(
  alertId: string,
  payload: UpdateAlertPayload
): Promise<PatientAlert> {
  const response = await httpClient.patch<PatientAlert>(`/patient-alerts/${alertId}`, payload)
  return response.data
}

export async function deletePatientAlert(alertId: string): Promise<void> {
  await httpClient.delete(`/patient-alerts/${alertId}`)
}

export function usePatientAlertsQuery(patientId: string) {
  return useQuery({
    queryKey: [PATIENT_ALERTS_QUERY_KEY, patientId],
    queryFn: () => fetchPatientAlerts(patientId),
    enabled: !!patientId,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  })
}

export function useCreatePatientAlertMutation(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAlertPayload) => createPatientAlert(patientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENT_ALERTS_QUERY_KEY, patientId] })
    },
  })
}

export function useUpdatePatientAlertMutation(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ alertId, payload }: { alertId: string; payload: UpdateAlertPayload }) =>
      updatePatientAlert(alertId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENT_ALERTS_QUERY_KEY, patientId] })
    },
  })
}

export function useDeletePatientAlertMutation(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (alertId: string) => deletePatientAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENT_ALERTS_QUERY_KEY, patientId] })
    },
  })
}
