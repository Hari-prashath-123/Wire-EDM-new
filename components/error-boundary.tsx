"use client"

import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    console.error("[v0] ErrorBoundary caught error:", error.message)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error("[v0] ErrorBoundary details:", errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-900 text-red-200 rounded-lg border border-red-700">
            <p className="font-semibold">Scene Rendering Error</p>
            <p className="text-sm mt-1">{this.state.error?.message}</p>
          </div>
        )
      )
    }

    return this.props.children
  }
}
