import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Programs from "./pages/Programs";
import Enrollments from "./pages/Enrollments";
import ApiDocs from "./pages/ApiDocs";
import NotFound from "./pages/not-found";
import AuthPage from "./pages/auth-page";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <ProtectedRoute path="/" component={() => 
        <AppShell>
          <Dashboard />
        </AppShell>
      } />
      
      <ProtectedRoute path="/clients" component={() => 
        <AppShell>
          <Clients />
        </AppShell>
      } />
      
      <ProtectedRoute path="/programs" component={() => 
        <AppShell>
          <Programs />
        </AppShell>
      } />
      
      <ProtectedRoute path="/enrollments" component={() => 
        <AppShell>
          <Enrollments />
        </AppShell>
      } />
      
      <ProtectedRoute path="/api-docs" component={() => 
        <AppShell>
          <ApiDocs />
        </AppShell>
      } />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
