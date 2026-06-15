import { Component, type ReactNode } from 'react'
import { ALERT_MESSAGES } from '../constants/messages'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // TODO: enviar a servicio de monitoreo (Sentry, Datadog, etc.)
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-800">{ALERT_MESSAGES.errorBoundaryTitle}</p>
              <p className="mt-2 text-sm text-slate-500">{ALERT_MESSAGES.errorBoundaryHint}</p>
              <button
                type="button"
                onClick={this.handleReset}
                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                {ALERT_MESSAGES.actions.retry}
              </button>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}
