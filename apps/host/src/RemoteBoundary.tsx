import { Component, Suspense, type ReactNode } from "react";

type Props = {
  name: string;
  children: ReactNode;
};

type State = {
  error: Error | null;
};

/**
 * Isolates a single remote. A remote that fails to load — dev server down,
 * bad URL, version skew — degrades to a message instead of taking the host
 * down with it.
 */
class RemoteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(`[host] remote "${this.props.name}" failed to load`, error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="remote-error">
          <strong>{this.props.name} is unavailable.</strong>
          <p>Is its dev server running? {this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function RemoteBoundary({ name, children }: Props) {
  return (
    <RemoteErrorBoundary name={name}>
      <Suspense fallback={<div className="remote-loading">Loading {name}…</div>}>
        {children}
      </Suspense>
    </RemoteErrorBoundary>
  );
}
