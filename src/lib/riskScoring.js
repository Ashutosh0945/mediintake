const SYMPTOM_SCORES = {
  chest_pain: 30, breathlessness: 25, loss_of_consciousness: 40,
  severe_headache: 20, high_fever: 15, vomiting: 10, dizziness: 12,
  weakness: 10, abdominal_pain: 12, back_pain: 8, nausea: 8, cough: 5,
  fatigue: 5, seizure: 38, confusion: 22, numbness: 18, vision_changes: 20, palpitations: 18,
}

export const SYMPTOM_OPTIONS = [
  { value: 'chest_pain', label: 'Chest Pain' },
  { value: 'breathlessness', label: 'Breathlessness / Difficulty Breathing' },
  { value: 'loss_of_consciousness', label: 'Loss of Consciousness' },
  { value: 'severe_headache', label: 'Severe Headache' },
  { value: 'seizure', label: 'Seizure' },
  { value: 'confusion', label: 'Confusion / Disorientation' },
  { value: 'numbness', label: 'Numbness or Paralysis' },
  { value: 'vision_changes', label: 'Sudden Vision Changes' },
  { value: 'palpitations', label: 'Heart Palpitations' },
  { value: 'high_fever', label: 'High Fever' },
  { value: 'vomiting', label: 'Vomiting' },
  { value: 'dizziness', label: 'Dizziness / Lightheadedness' },
  { value: 'weakness', label: 'General Weakness' },
  { value: 'abdominal_pain', label: 'Abdominal Pain' },
  { value: 'back_pain', label: 'Back Pain' },
  { value: 'nausea', label: 'Nausea' },
  { value: 'cough', label: 'Cough' },
  { value: 'fatigue', label: 'Fatigue' },
]

const SEVERITY_MULTIPLIERS = { mild: 1.0, moderate: 1.5, severe: 2.0 }

const CHRONIC_CONDITION_SCORES = {
  heart_disease: 20, hypertension: 10, diabetes: 10, asthma: 8, copd: 12,
  cancer: 15, kidney_disease: 12, stroke_history: 18, epilepsy: 15,
}

export const CHRONIC_CONDITION_OPTIONS = [
  { value: 'heart_disease', label: 'Heart Disease' },
  { value: 'hypertension', label: 'Hypertension' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'asthma', label: 'Asthma' },
  { value: 'copd', label: 'COPD' },
  { value: 'cancer', label: 'Cancer' },
  { value: 'kidney_disease', label: 'Kidney Disease' },
  { value: 'stroke_history', label: 'Stroke History' },
  { value: 'epilepsy', label: 'Epilepsy' },
]

export function calculateRiskScore({ symptoms = [], severity = 'mild', heartRate, temperature, bpSystolic, age, chronicConditions = [] }) {
  const breakdown = {}
  let total = 0
  const multiplier = SEVERITY_MULTIPLIERS[severity] ?? 1.0

  symptoms.forEach((s) => {
    const base = SYMPTOM_SCORES[s] ?? 0
    const weighted = Math.round(base * multiplier)
    total += weighted
    breakdown[`symptom_${s}`] = { points: weighted, reason: `${s.replace(/_/g, ' ')} (×${multiplier} severity)` }
  })

  if (heartRate) {
    let hrPoints = 0
    if (heartRate > 150) hrPoints = 30
    else if (heartRate > 120) hrPoints = 20
    else if (heartRate > 100) hrPoints = 10
    else if (heartRate < 40) hrPoints = 30
    else if (heartRate < 50) hrPoints = 20
    else if (heartRate < 60) hrPoints = 8
    if (hrPoints > 0) { breakdown.heart_rate = { points: hrPoints, reason: `Heart rate ${heartRate} bpm` }; total += hrPoints }
  }

  if (temperature) {
    let tempPoints = 0
    if (temperature >= 40) tempPoints = 20
    else if (temperature >= 38.5) tempPoints = 10
    else if (temperature < 35) tempPoints = 20
    if (tempPoints > 0) { breakdown.temperature = { points: tempPoints, reason: `Temperature ${temperature}°C` }; total += tempPoints }
  }

  if (bpSystolic) {
    let bpPoints = 0
    if (bpSystolic >= 180) bpPoints = 25
    else if (bpSystolic >= 160) bpPoints = 15
    else if (bpSystolic < 90) bpPoints = 30
    else if (bpSystolic < 100) bpPoints = 15
    if (bpPoints > 0) { breakdown.blood_pressure = { points: bpPoints, reason: `Systolic BP ${bpSystolic} mmHg` }; total += bpPoints }
  }

  if (age) {
    let agePoints = 0
    if (age >= 80) agePoints = 20
    else if (age >= 70) agePoints = 15
    else if (age >= 60) agePoints = 10
    else if (age >= 50) agePoints = 5
    if (agePoints > 0) { breakdown.age = { points: agePoints, reason: `Age ${age} years` }; total += agePoints }
  }

  chronicConditions.forEach((c) => {
    const pts = CHRONIC_CONDITION_SCORES[c] ?? 0
    if (pts > 0) { breakdown[`condition_${c}`] = { points: pts, reason: c.replace(/_/g, ' ') }; total += pts }
  })

  const score = Math.min(total, 100)
  const level = score >= 61 ? 'high' : score >= 31 ? 'medium' : 'low'
  return { score, level, breakdown }
}

export const RISK_COLORS = {
  low:    { bg: 'badge-low',    dot: 'bg-green-600',  text: 'text-green-700',  border: 'border-green-300' },
  medium: { bg: 'badge-medium', dot: 'bg-orange-600', text: 'text-orange-700', border: 'border-orange-300' },
  high:   { bg: 'badge-high',   dot: 'bg-red-700',    text: 'text-red-800',    border: 'border-red-300' },
}
