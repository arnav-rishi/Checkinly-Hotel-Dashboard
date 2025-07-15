
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SearchProvider } from '@/contexts/SearchContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Rooms } from '@/pages/Rooms';
import { Guests } from '@/pages/Guests';
import { BookingCalendar } from '@/components/BookingCalendar';
import { Payments } from '@/pages/Payments';
import { Analytics } from '@/pages/Analytics';
import { SmartLocks } from '@/pages/SmartLocks';
import { Settings } from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SearchProvider>
            <Router>
              <AuthProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Dashboard />} />
                  </Route>
                  <Route path="/rooms" element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Rooms />} />
                  </Route>
                  <Route path="/guests" element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Guests />} />
                  </Route>
                  <Route path="/calendar" element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    <Route index element={
                      <div className="space-y-6">
                        <div>
                          <h1 className="text-3xl font-bold text-foreground">Booking Calendar</h1>
                          <p className="text-muted-foreground">View and manage hotel bookings</p>
                        </div>
                        <BookingCalendar />
                      </div>
                    } />
                  </Route>
                  <Route path="/payments" element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Payments />} />
                  </Route>
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Analytics />} />
                  </Route>
                  <Route path="/smart-locks" element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<SmartLocks />} />
                  </Route>
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Settings />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </Router>
          </SearchProvider>
        </ThemeProvider>
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
