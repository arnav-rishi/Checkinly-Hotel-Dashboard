import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HotelSetup } from "@/components/HotelSetup";
import { useHotel } from "@/hooks/useHotel";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Index } from "@/pages";
import { Login } from "@/pages/Login";
import { Rooms } from "@/pages/Rooms";
import { Guests } from "@/pages/Guests";
import { BookingCalendar } from "@/pages/BookingCalendar";
import { Payments } from "@/pages/Payments";
import { Analytics } from "@/pages/Analytics";
import { SmartLocks } from "@/pages/SmartLocks";
import { Settings } from "@/pages/Settings";
import { NotFound } from "@/pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hotel, profile, loading: hotelLoading } = useHotel();

  if (authLoading || (isAuthenticated && hotelLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show hotel setup if user is authenticated but has no hotel/profile
  if (isAuthenticated && !hotel && !profile) {
    return <HotelSetup onComplete={() => window.location.reload()} />;
  }

  return (
    <SearchProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route index element={<Index />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/guests" element={<Guests />} />
                <Route path="/calendar" element={<BookingCalendar />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/smart-locks" element={<SmartLocks />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </SearchProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
