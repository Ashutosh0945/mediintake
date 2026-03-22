import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AuthCallback from './pages/auth/AuthCallback'
import PatientDashboard from './pages/patient/PatientDashboard'
import MedicalProfile from './pages/patient/MedicalProfile'
import NewIntake from './pages/patient/NewIntake'
import IntakeHistory from './pages/patient/IntakeHistory'
import EditProfile from './pages/patient/EditProfile'
import AppointmentRequest from './pages/patient/AppointmentRequest'
import Notifications from './pages/patient/Notifications'
import ChangePassword from './pages/patient/ChangePassword'
import MedicationReminders from './pages/patient/MedicationReminders'
import HospitalsNearMe from './pages/patient/HospitalsNearMe'
import Vaccinations from './pages/patient/Vaccinations'
import HealthScoreCard from './pages/patient/HealthScoreCard'
import AdminDashboard from './pages/admin/AdminDashboard'
import PatientDetail from './pages/admin/PatientDetail'
import EmergencyView from './pages/admin/EmergencyView'
import DoctorProfile from './pages/admin/DoctorProfile'
import BulkMessage from './pages/admin/BulkMessage'
import Analytics from './pages/admin/Analytics'
import PrintPatientSummary from './pages/admin/PrintPatientSummary'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

              <Route element={<ProtectedRoute role="patient" />}>
                <Route path="/dashboard" element={<PatientDashboard />} />
                <Route path="/medical-profile" element={<MedicalProfile />} />
                <Route path="/new-intake" element={<NewIntake />} />
                <Route path="/my-intakes" element={<IntakeHistory />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/appointments" element={<AppointmentRequest />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/medication-reminders" element={<MedicationReminders />} />
                <Route path="/hospitals-near-me" element={<HospitalsNearMe />} />
                <Route path="/vaccinations" element={<Vaccinations />} />
                <Route path="/health-score" element={<HealthScoreCard />} />
              </Route>

              <Route element={<ProtectedRoute role="admin" />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/patient/:id" element={<PatientDetail />} />
                <Route path="/admin/emergency/:intakeId" element={<EmergencyView />} />
                <Route path="/admin/doctor-profile" element={<DoctorProfile />} />
                <Route path="/admin/bulk-message" element={<BulkMessage />} />
                <Route path="/admin/analytics" element={<Analytics />} />
                <Route path="/admin/patient/:id/print" element={<PrintPatientSummary />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
