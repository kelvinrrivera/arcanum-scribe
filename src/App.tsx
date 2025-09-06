import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { usePerformance } from "@/hooks/usePerformance";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Showcase from "./pages/Showcase";
import Generate from "./pages/Generate";
import Gallery from "./pages/Gallery";
import Library from "./pages/Library";
import AdventureView from "./pages/AdventureView";
import Pricing from "./pages/Pricing";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Initialize performance monitoring and optimizations
  usePerformance({
    enableServiceWorker: true,
    enablePerformanceMonitoring: true,
    enableResourceHints: true,
    preloadResources: true,
  });

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="arcanum-scribe-theme">
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<Index />} />
                  <Route path="/showcase" element={<Showcase />} />
                  <Route path="/generate" element={<ProtectedRoute><Generate /></ProtectedRoute>} />
                  <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
                  <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
                  <Route path="/adventure/:id" element={<ProtectedRoute><AdventureView /></ProtectedRoute>} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
