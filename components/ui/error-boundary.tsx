"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback: ReactNode;
  /** Called once when the subtree fails, so the parent can stop retrying. */
  onError?: (error: Error) => void;
};

type State = { hasError: boolean };

/**
 * Keeps one failing subtree from taking the page with it.
 *
 * The 3D scene streams from a third-party CDN: a corporate proxy, an offline
 * visitor or a blocked domain must degrade to a still visual, never to a blank
 * document.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("[MSDEV] a subtree failed and fell back to its static state:", error, info);
    this.props.onError?.(error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export default ErrorBoundary;
