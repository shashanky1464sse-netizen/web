import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ScreenGuard } from './components/shared/ScreenGuard';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';

// Lazy-loaded pages
const Landing = lazy(() => import('./pages/Landing'));
const Splash = lazy(() => import('./pages/Splash'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Home = lazy(() => import('./pages/Home'));
const UploadResume = lazy(() => import('./pages/UploadResume'));
const ResumeSkills = lazy(() => import('./pages/ResumeSkills'));
const Interview = lazy(() => import('./pages/Interview'));
const InterviewSuccess = lazy(() => import('./pages/InterviewSuccess'));
const Reports = lazy(() => import('./pages/Reports'));
const ReportDetail = lazy(() => import('./pages/ReportDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const Notifications = lazy(() => import('./pages/Notifications'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
// Preferences is now integrated into Profile

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ScreenGuard>
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading Resume2Interview...</div>}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/splash" element={<Splash />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Routes inside AppShell */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/upload-resume" element={<UploadResume />} />
                  <Route path="/resume-skills" element={<ResumeSkills />} />
                  <Route path="/interview" element={<Interview />} />
                  <Route path="/interview-success" element={<InterviewSuccess />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/reports/:id" element={<ReportDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/edit-profile" element={<EditProfile />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/help" element={<HelpCenter />} />
{/* Preferences moved to Profile */}
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster position="bottom-right" />
      </ScreenGuard>
    </QueryClientProvider>
  );
}

export default App;
