import { Redirect, Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import DashboardPage from "@/pages/app/dashboard";
import SmartDumpPage from "@/pages/app/smart-dump.tsx";
import ExtractionPage from "@/pages/app/extraction.tsx";
import ReportsPage from "@/pages/app/reports.tsx";
import WorkflowPage from "@/pages/app/workflow.tsx";

function isAuthed(): boolean {
  try {
    return window.localStorage.getItem("autogst.authed") === "1";
  } catch {
    return false;
  }
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background ag-bg-grid">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}

function ProtectedRoute({ path, component: Component }: { path: string; component: any }) {
  return (
    <Route
      path={path}
      component={(props: any) => {
        if (!isAuthed()) return <Redirect to="/login" />;
        return <Component {...props} />;
      }}
    />
  );
}

function Router() {
  const [, setLocation] = useLocation();

  return (
    <Switch>
      <Route path="/" component={() => <Redirect to={isAuthed() ? "/app" : "/login"} />} />

      <Route
        path="/logout"
        component={() => {
          try {
            window.localStorage.removeItem("autogst.authed");
          } catch {
            // ignore
          }
          setLocation("/login");
          return null;
        }}
      />

      <Route
        path="/login"
        component={() => (
          <AppShell>
            <LoginPage />
          </AppShell>
        )}
      />
      <Route
        path="/register"
        component={() => (
          <AppShell>
            <RegisterPage />
          </AppShell>
        )}
      />
      <Route
        path="/forgot-password"
        component={() => (
          <AppShell>
            <ForgotPasswordPage />
          </AppShell>
        )}
      />

      <ProtectedRoute
        path="/app"
        component={() => (
          <AppShell>
            <DashboardPage />
          </AppShell>
        )}
      />
      <ProtectedRoute
        path="/app/smart-dump"
        component={() => (
          <AppShell>
            <SmartDumpPage />
          </AppShell>
        )}
      />
      <ProtectedRoute
        path="/app/extraction"
        component={() => (
          <AppShell>
            <ExtractionPage />
          </AppShell>
        )}
      />
      <ProtectedRoute
        path="/app/reports"
        component={() => (
          <AppShell>
            <ReportsPage />
          </AppShell>
        )}
      />
      <ProtectedRoute
        path="/app/workflow"
        component={() => (
          <AppShell>
            <WorkflowPage />
          </AppShell>
        )}
      />

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
