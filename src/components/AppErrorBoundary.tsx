import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export default class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Keep a console trail for debugging (shown in DevTools)
    console.error("App crashed:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.assign("/");
  };

  private handleGoToSignIn = () => {
    window.location.assign("/auth");
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The page crashed while loading. Try reloading; if it keeps happening, go back to sign in.
            </p>

            {this.state.error?.message && (
              <pre className="text-xs whitespace-pre-wrap rounded-md bg-muted p-3 border border-border">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex flex-wrap gap-2">
              <Button onClick={this.handleReload}>Reload</Button>
              <Button variant="outline" onClick={this.handleGoToSignIn}>
                Sign in
              </Button>
              <Button variant="ghost" onClick={this.handleGoHome}>
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
