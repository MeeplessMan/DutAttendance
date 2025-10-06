// File: src/App.tsx
// --- COMPLETE FIXED VERSION WITH PROPER ROUTING ---

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import AttendancePage from './components/AttendancePage';
import EnrollmentPage from './components/EnrollmentPage';
import AttendanceHistory from './components/AttendanceHistory';
import AdminDashboard from './components/AdminDashboard';
import AdminDegrees from './components/AdminDegrees';
import AdminStreams from './components/AdminStreams';
import AdminAcademicYears from './components/AdminAcademicYears';
import AdminStudentGroup from './components/AdminStudentGroup';
import AdminModules from './components/AdminModules';
import AdminVenues from './components/AdminVenues';
import AdminSchedules from './components/AdminSchedules';
import StudentsPage from './components/StudentsPage';
import LecturerDashboard from './components/LecturerDashboard';
import TimetablePage from './components/CourseManagementPage';
import { AnimatePresence } from 'framer-motion';
import AdminEnrollmentApproval from './components/AdminEnrollmentApproval';
import StudentDashboard from './components/StudentDashboard';
import { StudentTimetable } from './components/StudentTimetable';
import { StudentDegreeSelection } from './components/StudentDegreeSelection';

// Component for standalone admin pages (no sidebar)
function StandaloneAdminPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  if (!user) {
    return <Login />;
  }

  // For Students - show student dashboard with proper routing
  if (user.role === 'student') {
    return (
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<StudentDashboard />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/enrollment" element={<EnrollmentPage />} />
            <Route path="/degree-selection" element={<StudentDegreeSelection />} />
            <Route path="/history" element={<AttendanceHistory />} />
            <Route path="/timetable" element={<StudentTimetable />} />
            {/* Redirect any unknown routes to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    );
  }

  // For Lecturers - special case
  if (user.role === 'lecturer') {
    return (
      <Layout>
        <LecturerDashboard />
      </Layout>
    );
  }

  // For Admins - complete admin routing
  if (user.role === 'admin') {
    return (
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/enrollment" element={<EnrollmentPage />} />
            <Route path="/history" element={<AttendanceHistory />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/degree-selection" element={<StudentDegreeSelection />} />
            {/* Redirect any unknown routes to admin dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    );
  }

  // Default fallback
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <p>Unknown user role</p>
      </div>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Standalone Admin Pages (without sidebar) */}
          <Route path="/admin/degrees" element={
            <StandaloneAdminPage>
              <AdminDegrees />
            </StandaloneAdminPage>
          } />
          <Route path="/admin/streams" element={
            <StandaloneAdminPage>
              <AdminStreams />
            </StandaloneAdminPage>
          } />
          <Route path="/admin/academic-years" element={
            <StandaloneAdminPage>
              <AdminAcademicYears />
            </StandaloneAdminPage>
          } />
          <Route path="/admin/student-groups" element={
            <StandaloneAdminPage>
              <AdminStudentGroup degrees={[]} academicYears={[]} />
            </StandaloneAdminPage>
          } />
          <Route path="/admin/modules" element={
            <StandaloneAdminPage>
              <AdminModules />
            </StandaloneAdminPage>
          } />
          <Route path="/admin/venues" element={
            <StandaloneAdminPage>
              <AdminVenues />
            </StandaloneAdminPage>
          } />
          <Route path="/admin/schedules" element={
            <StandaloneAdminPage>
              <AdminSchedules />
            </StandaloneAdminPage>
          } />
          <Route path="/admin/enrollment-approval" element={
            <StandaloneAdminPage>
              <AdminEnrollmentApproval />
            </StandaloneAdminPage>
          } />

          {/* Main App with Layout */}
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;