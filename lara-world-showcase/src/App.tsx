import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PortalLogin from "./pages/PortalLogin";
import Dashboard from "./pages/Dashboard";
import PortalDashboard from "./pages/PortalDashboard";
import PortalLayout from "./components/PortalLayout";
import AuthCallback from "./pages/AuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import TaskManagement from "./pages/TaskManagement";
import UserManagement from "./pages/UserManagement";
import MailCommandCenter from "./pages/MailCommandCenter";
import InfrastructureGallery from "./pages/InfrastructureGallery";
import LogHorizon from "./pages/LogHorizon";
import UnitTestingShowcase from "./pages/UnitTestingShowcase";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/portal/login" element={<PortalLogin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/portal" 
            element={
              <ProtectedRoute>
                <PortalLayout />
              </ProtectedRoute>
            } 
          >
            <Route index element={<PortalDashboard />} />
            <Route path="tasks" element={<TaskManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="mail" element={<MailCommandCenter />} />
            <Route path="devops" element={<InfrastructureGallery />} />
            <Route path="logs" element={<LogHorizon />} />
            <Route path="tests" element={<UnitTestingShowcase />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
