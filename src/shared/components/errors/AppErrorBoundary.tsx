import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorFallback } from './ErrorFallback'

interface Props {
  children: ReactNode
}

interface State {
  error: unknown
}


export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: unknown): State {
    return { error }
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {

    console.error(error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.error === null) return this.props.children
    return <ErrorFallback error={this.state.error} standalone />
  }
}
