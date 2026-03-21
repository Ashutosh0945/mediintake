import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import RiskBadge from '../../components/RiskBadge'
import { ArrowLeft, Droplets, AlertCircle, Pill, Phone, Heart, Thermometer, Activity, Clock, Siren } from 'lucide-react'

export default function EmergencyView() {
  const { intakeId } = useParams()
  const [intake, setIntake] = useState(null)
  const [patient, setPatient] = useState(null)
  const [medProfile, setMedProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: intakeData } = await supabase
        .from('intakes')
        .select('*, profiles(*)')
        .eq('id', intakeId)
        .single()

      if (intakeData) {
        setIntake(intakeData)
        setPatient(intakeData.profiles)
        const { data: med } = await supabase
          .from('medical_profiles')
          .select('*')
          .eq('patient_id', intakeData.patient_id)
          .single()
        setMedProfile(med)
      }
      setLoading(false)
    }
    load()
  }, [intakeId])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-red-500 rounded-full animate-spin" />
    </div>
  )

  if (!intake) return <div className="min-h-screen flex items-center justify-center text-slate-400">Intake not found.</div>

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Emergency banner */}
        <div className="bg-red-500/10 border border-red-500/40 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3 animate-fade-in">
          <Siren className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-300 font-display font-bold text-lg">EMERGENCY VIEW</p>
            <p className="text-red-400/70 text-xs">Critical patient information — for medical staff use only</p>
          </div>
          <RiskBadge level={intake.risk_level} score={intake.risk_score} showScore />
        </div>

        <Link to="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Dashboard
        </Link>

        {/* Patient ID */}
        <div className="card p-5 mb-5 animate-slide-up">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Patient</p>
              <h1 className="font-display text-2xl font-bold text-white">{patient?.full_name || 'Unknown'}</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                {patient?.age && `${patient.age} years`}
                {patient?.gender && ` · ${patient.gender}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Intake time</p>
              <p className="text-sm text-slate-300 font-medium">
                {new Date(intake.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>
        </div>

        {/* Critical vitals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 animate-stagger">
          {[
            { icon: Activity, label: 'Heart Rate', value: intake.heart_rate ? `${intake.heart_rate} bpm` : '—', color: 'red',
              alert: intake.heart_rate > 120 || intake.heart_rate < 50 },
            { icon: Thermometer, label: 'Temperature', value: intake.temperature ? `${intake.temperature}°C` : '—', color: 'orange',
              alert: intake.temperature >= 38.5 || intake.temperature < 35 },
            { icon: Heart, label: 'Blood Pressure', value: intake.bp_systolic ? `${intake.bp_systolic}/${intake.bp_diastolic}` : '—', color: 'pink',
              alert: intake.bp_systolic >= 160 || intake.bp_systolic < 90 },
            { icon: Clock, label: 'Duration', value: intake.duration_hours ? `${intake.duration_hours}h` : '—', color: 'blue', alert: false },
          ].map(({ icon: Icon, label, value, color, alert }) => (
            <div key={label} className={`card p-4 ${alert ? 'border-red-500/40 bg-red-500/5' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 text-${color}-400`} />
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                {alert && <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse ml-auto" />}
              </div>
              <p className={`font-display text-xl font-bold ${alert ? 'text-red-300' : 'text-white'}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Symptoms */}
        <div className="card p-5 mb-4 animate-fade-in">
          <h2 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Presenting Symptoms
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-md font-medium capitalize ${
              intake.severity === 'severe' ? 'bg-red-500/20 text-red-400' :
              intake.severity === 'moderate' ? 'bg-amber-500/20 text-amber-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>{intake.severity}</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(intake.symptoms) && intake.symptoms.map(s => (
              <span key={s} className="bg-slate-800 border border-slate-700 text-slate-300 text-sm px-3 py-1 rounded-full capitalize">
                {s.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
          {intake.notes && (
            <div className="mt-3 pt-3 border-t border-slate-800">
              <p className="text-xs text-slate-500 mb-1">Patient notes</p>
              <p className="text-sm text-slate-300">{intake.notes}</p>
            </div>
          )}
        </div>

        {/* Medical profile critical info */}
        {medProfile ? (
          <div className="grid sm:grid-cols-2 gap-4 animate-stagger">
            {/* Blood Group */}
            <div className="card p-5 border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-4 h-4 text-red-400" />
                <p className="text-xs text-red-400 font-semibold uppercase tracking-wider">Blood Group</p>
              </div>
              <p className="font-display text-4xl font-bold text-red-300">{medProfile.blood_group || 'Unknown'}</p>
            </div>

            {/* Allergies */}
            <div className="card p-5 border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Allergies</p>
              </div>
              <p className="text-sm text-amber-200">{medProfile.allergies || 'None reported'}</p>
            </div>

            {/* Chronic Conditions */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-teal-400" />
                <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider">Chronic Conditions</p>
              </div>
              {medProfile.chronic_conditions?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {medProfile.chronic_conditions.map(c => (
                    <span key={c} className="bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm px-3 py-1 rounded-full capitalize">
                      {c.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">None reported</p>
              )}
            </div>

            {/* Medications */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Current Medications</p>
              </div>
              <p className="text-sm text-slate-300">{medProfile.current_medications || 'None reported'}</p>
            </div>

            {/* Emergency Contact */}
            {medProfile.emergency_contact_name && (
              <div className="sm:col-span-2 card p-5 border-teal-500/20 bg-teal-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-teal-400" />
                  <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider">Emergency Contact</p>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-lg font-semibold text-white">{medProfile.emergency_contact_name}</p>
                    {medProfile.emergency_contact_relation && (
                      <p className="text-sm text-slate-400">{medProfile.emergency_contact_relation}</p>
                    )}
                  </div>
                  {medProfile.emergency_contact_phone && (
                    <a
                      href={`tel:${medProfile.emergency_contact_phone}`}
                      className="btn-primary flex items-center gap-2 text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      {medProfile.emergency_contact_phone}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card p-8 text-center border-amber-500/20 bg-amber-500/5 animate-fade-in">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <p className="text-amber-300 font-semibold">No Medical Profile on File</p>
            <p className="text-amber-400/70 text-sm mt-1">Patient has not completed their medical profile yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}
