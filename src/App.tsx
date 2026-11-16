import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { CreditsProvider } from "@/hooks/useCredits";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MockTest from "./pages/MockTest";
import MockTestList from "./pages/MockTestList";
import NotFound from "./pages/NotFound";
import Billing from "./pages/Billing";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CreditsProvider>
        <ThemeProvider defaultTheme="dark">
          <UserDataProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/mock-tests" element={<MockTestList />} />
                  <Route path="/mock-test" element={<MockTest />} />
                  <Route path="/billing" element={<Billing />} />
                  <Route path="/profile" element={<Profile />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </UserDataProvider>
        </ThemeProvider>
      </CreditsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
