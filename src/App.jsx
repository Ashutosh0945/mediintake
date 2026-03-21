import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import PatientDashboard from './pages/patient/PatientDashboard'
import MedicalProfile from './pages/patient/MedicalProfile'
import NewIntake from './pages/patient/NewIntake'
import IntakeHistory from './pages/patient/IntakeHistory'
import EditProfile from './pages/patient/EditProfile'
import AppointmentRequest from './pages/patient/AppointmentRequest'
import Notifications from './pages/patient/Notifications'
import ChangePassword from './pages/patient/ChangePassword'
import MedicationReminders from './pages/patient/MedicationReminders'
import AdminDashboard from './pages/admin/AdminDashboard'
import PatientDetail from './pages/admin/PatientDetail'
import EmergencyView from './pages/admin/EmergencyView'
import DoctorProfile from './pages/admin/DoctorProfile'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
          </Route>

          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/patient/:id" element={<PatientDetail />} />
            <Route path="/admin/emergency/:intakeId" element={<EmergencyView />} />
            <Route path="/admin/doctor-profile" element={<DoctorProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
