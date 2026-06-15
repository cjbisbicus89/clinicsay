import { useState, useCallback } from 'react'
import PatientAlertsPanel from './PatientAlertsPanel'
import { ALERT_MESSAGES } from '../../../constants/messages'

type PatientRecordTab = 'datos' | 'citas' | 'alertas'

const patientRecordTabs: Array<{ key: PatientRecordTab; label: string }> = [
  { key: 'datos', label: ALERT_MESSAGES.patientRecord.tabs.data },
  { key: 'citas', label: ALERT_MESSAGES.patientRecord.tabs.appointments },
  { key: 'alertas', label: ALERT_MESSAGES.patientRecord.tabs.alerts },
]

export default function PatientRecordLayout() {
  const [activePatientRecordTab, setActivePatientRecordTab] = useState<PatientRecordTab>('alertas')

  const handleTabChange = useCallback((tab: PatientRecordTab) => {
    setActivePatientRecordTab(tab)
  }, [])

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-primary px-6 py-5">
        <div className="text-2xl font-semibold text-white">
          Clinic<span>Say</span>
        </div>
        <p className="mt-1 text-sm text-white/80">{ALERT_MESSAGES.patientRecord.title}</p>
      </div>

      <div className="border-b border-slate-200 bg-surface px-6 py-4">
        <h1 className="text-lg font-semibold text-slate-800">Ana Torres</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          DNI 12345678 · 34 años · Sede Miraflores
        </p>
      </div>

      <nav role="tablist" aria-label="Secciones de ficha médica" className="flex gap-1 border-b border-slate-200 px-6">
        {patientRecordTabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activePatientRecordTab === tab.key}
            id={`tab-${tab.key}`}
            onClick={() => handleTabChange(tab.key)}
            type="button"
            className={`relative px-4 py-3 text-sm font-medium transition-colors ${
              activePatientRecordTab === tab.key
                ? 'text-primary'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {activePatientRecordTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-6">
        {patientRecordTabs.map((tab) => (
          <div
            key={tab.key}
            role="tabpanel"
            id={`panel-${tab.key}`}
            aria-labelledby={`tab-${tab.key}`}
            hidden={activePatientRecordTab !== tab.key}
          >
            {tab.key === 'datos' && (
              <p className="text-slate-500">{ALERT_MESSAGES.patientRecord.placeholders.data}</p>
            )}
            {tab.key === 'citas' && (
              <p className="text-slate-500">{ALERT_MESSAGES.patientRecord.placeholders.appointments}</p>
            )}
            {tab.key === 'alertas' && (
              <PatientAlertsPanel patientId="550e8400-e29b-41d4-a716-446655440000" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
