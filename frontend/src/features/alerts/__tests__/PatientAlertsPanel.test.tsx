import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PatientAlertsPanel from '../components/PatientAlertsPanel'
import { Severity, AlertType } from '../types'
import { ALERT_MESSAGES } from '../../../constants/messages'

const mockUsePatientAlertsQuery = vi.fn()
const mockUseCreatePatientAlertMutation = vi.fn()
const mockUseUpdatePatientAlertMutation = vi.fn()
const mockUseDeletePatientAlertMutation = vi.fn()

vi.mock('../api/usePatientAlertsApi', () => ({
  usePatientAlertsQuery: (...args: unknown[]) => mockUsePatientAlertsQuery(...args),
  useCreatePatientAlertMutation: () => mockUseCreatePatientAlertMutation(),
  useUpdatePatientAlertMutation: () => mockUseUpdatePatientAlertMutation(),
  useDeletePatientAlertMutation: () => mockUseDeletePatientAlertMutation(),
  isApiError: vi.fn(),
  fetchPatientAlerts: vi.fn(),
  createPatientAlert: vi.fn(),
  updatePatientAlert: vi.fn(),
  deletePatientAlert: vi.fn(),
}))

function QueryClientTestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('PatientAlertsPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockUseCreatePatientAlertMutation.mockReturnValue({ mutate: vi.fn(), isPending: false })
    mockUseUpdatePatientAlertMutation.mockReturnValue({ mutate: vi.fn(), isPending: false })
    mockUseDeletePatientAlertMutation.mockReturnValue({ mutate: vi.fn(), isPending: false })
  })

  it('muestra skeleton de carga estilizado con paleta ClinicSay', () => {
    mockUsePatientAlertsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    })

    render(<PatientAlertsPanel patientId="p1" />, { wrapper: QueryClientTestWrapper })

    const loadingRegion = screen.getByRole('status', { name: ALERT_MESSAGES.loading })
    expect(loadingRegion).toBeInTheDocument()
  })

  it('ordena alertas activas primero y luego por severidad descendente', () => {
    const mixedPatientAlertsList = [
      {
        id: 'a1',
        patientId: 'p1',
        type: AlertType.ADMINISTRATIVE,
        severity: Severity.LOW,
        message: 'Alerta baja inactiva',
        isActive: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'a2',
        patientId: 'p1',
        type: AlertType.MEDICAL_RISK,
        severity: Severity.HIGH,
        message: 'Alerta alta activa',
        isActive: true,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
      {
        id: 'a3',
        patientId: 'p1',
        type: AlertType.SPECIAL_CONDITION,
        severity: Severity.MEDIUM,
        message: 'Alerta media activa',
        isActive: true,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      },
      {
        id: 'a4',
        patientId: 'p1',
        type: AlertType.ALLERGY,
        severity: Severity.HIGH,
        message: 'Alerta alta inactiva',
        isActive: false,
        createdAt: '2024-01-04T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
      },
    ]

    mockUsePatientAlertsQuery.mockReturnValue({
      data: mixedPatientAlertsList,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<PatientAlertsPanel patientId="p1" />, { wrapper: QueryClientTestWrapper })

    const renderedAlertMessages = screen.getAllByText(/Alerta /i).map((node) => node.textContent)

    expect(renderedAlertMessages).toEqual([
      'Alerta alta activa',
      'Alerta media activa',
      'Alerta alta inactiva',
      'Alerta baja inactiva',
    ])
  })

  it('muestra error y permite reintentar la carga', () => {
    const refetch = vi.fn()
    mockUsePatientAlertsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
      refetch,
    })

    render(<PatientAlertsPanel patientId="p1" />, { wrapper: QueryClientTestWrapper })

    expect(screen.getByText(ALERT_MESSAGES.errorTitle)).toBeInTheDocument()
    const retryButton = screen.getByRole('button', { name: ALERT_MESSAGES.actions.retry })
    retryButton.click()
    expect(refetch).toHaveBeenCalled()
  })

  it('muestra panel ilustrativo cuando no hay alertas registradas', () => {
    mockUsePatientAlertsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<PatientAlertsPanel patientId="p1" />, { wrapper: QueryClientTestWrapper })

    expect(screen.getByText(ALERT_MESSAGES.emptyTitle)).toBeInTheDocument()
    expect(screen.getByText(ALERT_MESSAGES.emptyHint)).toBeInTheDocument()
  })
})
