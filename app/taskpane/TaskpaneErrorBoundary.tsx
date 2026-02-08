"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class TaskpaneErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Taskpane error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-sm text-red-600 font-mono mb-4 max-w-md break-words">
            {this.state.error.message}
          </p>
          <p className="text-xs text-slate-500">
            Check the browser dev tools (F12) for more details. If the pane closes immediately,
            ensure you run <code className="bg-slate-200 px-1 rounded">npm run dev:https</code> and
            trust the certificate at https://localhost:3000.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
