import { useState, useEffect, useRef } from 'react'
import Navbar from '../../components/Navbar'
import { MapPin, Phone, Navigation, AlertCircle, RefreshCw, ExternalLink, Building2, Search, X } from 'lucide-react'

export default function HospitalsNearMe() {
  const [location, setLocation] = useState(null)
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [radius, setRadius] = useState(3000)
  const [search, setSearch] = useState('')
  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script')
      script.id = 'leaflet-js'
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => { if (location) initMap(location) }
      document.head.appendChild(script)
    }
    getLocation()
  }, [])

  useEffect(() => {
    if (location) {
      fetchHospitals(location)
      setTimeout(() => initMap(location), 500)
    }
  }, [location, radius])

  useEffect(() => {
    if (location && hospitals.length > 0) updateMarkers()
  }, [hospitals])

  function getLocation() {
    setLocating(true)
    setError('')
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      setLocating(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setError('Could not get your location. Please allow location access and try again.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function fetchHospitals(loc) {
    setLoading(true)
    setError('')
    try {
      const query = `[out:json][timeout:30];(node["amenity"="hospital"](around:${radius},${loc.lat},${loc.lng});way["amenity"="hospital"](around:${radius},${loc.lat},${loc.lng});node["amenity"="clinic"](around:${radius},${loc.lat},${loc.lng});node["healthcare"="hospital"](around:${radius},${loc.lat},${loc.lng}););out body center;`
      const mirrors = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
      ]
      let res = null
      for (const url of mirrors) {
        try {
          const ctrl = new AbortController()
          const t = setTimeout(() => ctrl.abort(), 35000)
          res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'data=' + encodeURIComponent(query),
            signal: ctrl.signal,
          })
          clearTimeout(t)
          if (res.ok) break
        } catch { continue }
      }
      if (!res || !res.ok) throw new Error('All mirrors failed')
      const data = await res.json()
      const results = data.elements
        .filter(el => el.tags?.name)
        .map(el => {
          const lat = el.lat || el.center?.lat
          const lng = el.lon || el.center?.lon
          const dist = haversine(loc.lat, loc.lng, lat, lng)
          return {
            id: el.id,
            name: el.tags.name,
            type: el.tags.amenity || el.tags.healthcare || 'hospital',
            phone: el.tags.phone || el.tags['contact:phone'] || null,
            address: [el.tags['addr:street'], el.tags['addr:city']].filter(Boolean).join(', ') || null,
            emergency: el.tags.emergency === 'yes',
            lat, lng, dist,
          }
        })
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 20)
      setHospitals(results)
      if (results.length === 0) setError(`No hospitals found within ${radius / 1000}km. Try increasing the radius.`)
    } catch {
      setError('Map service timed out. Try a smaller radius (2-3km) or try again in 30 seconds.')
    }
    setLoading(false)
  }

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  function initMap(loc) {
    const L = window.L
    if (!L || !mapRef.current) return
    if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null }
    const map = L.map(mapRef.current, { zoomControl: true }).setView([loc.lat, loc.lng], 14)
    leafletMap.current = map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map)
    const userIcon = L.divIcon({
      html: `<div style="width:16px;height:16px;background:#14b8a6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(20,184,166,0.3)"></div>`,
      className: '', iconAnchor: [8, 8],
    })
    L.marker([loc.lat, loc.lng], { icon: userIcon }).addTo(map).bindPopup('<b>📍 You are here</b>')
    updateMarkers()
  }

  function updateMarkers() {
    const L = window.L
    if (!L || !leafletMap.current) return
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    hospitals.forEach((h, i) => {
      if (!h.lat || !h.lng) return
      const icon = L.divIcon({
        html: `<div style="background:${h.emergency ? '#ef4444' : '#6366f1'};color:white;border:2px solid white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer;">${i + 1}</div>`,
        className: '', iconAnchor: [14, 14],
      })
      const marker = L.marker([h.lat, h.lng], { icon })
        .addTo(leafletMap.current)
        .bindPopup(`<b>${h.name}</b><br/>${(h.dist / 1000).toFixed(1)} km away${h.emergency ? '<br/>🚨 Emergency available' : ''}`)
      marker.on('click', () => setSelected(h))
      markersRef.current.push(marker)
    })
  }

  function flyTo(h) {
    setSelected(h)
    if (leafletMap.current) leafletMap.current.flyTo([h.lat, h.lng], 16, { duration: 1 })
  }

  function openDirections(h) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}&travelmode=driving`, '_blank')
  }

  const typeLabel = (type) => {
    if (type === 'hospital') return 'Hospital'
    if (type === 'clinic') return 'Clinic'
    return type?.charAt(0).toUpperCase() + type?.slice(1) || 'Healthcare'
  }

  const filteredHospitals = hospitals.filter(h =>
    !search || h.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3 mb-6 animate-slide-up">
          <div>
            <h1 className="section-title flex items-center gap-3">
              <MapPin className="w-7 h-7 text-teal-400" /> Hospitals Near Me
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {location ? `Showing hospitals within ${radius / 1000}km of your location` : 'Detecting your location…'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select className="input py-2 text-sm w-auto" value={radius} onChange={e => setRadius(Number(e.target.value))}>
              <option value={1000}>1 km</option>
              <option value={2000}>2 km</option>
              <option value={3000}>3 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
            </select>
            <button onClick={getLocation} disabled={locating} className="btn-secondary flex items-center gap-2 text-sm py-2">
              <RefreshCw className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
              {locating ? 'Locating…' : 'Refresh'}
            </button>
          </div>
        </div>

        {locating && (
          <div className="card p-4 mb-5 flex items-center gap-3 animate-fade-in">
            <div className="w-5 h-5 border-2 border-slate-700 border-t-teal-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Getting your precise location…</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        {location && (
          <div className="grid lg:grid-cols-5 gap-5">

            {/* Map */}
            <div className="lg:col-span-3">
              <div ref={mapRef} className="w-full rounded-2xl overflow-hidden border border-slate-800" style={{ height: '520px' }} />
              <p className="text-xs text-slate-600 mt-2 text-center">
                🟣 Hospitals / Clinics · 🔴 Emergency available · 🟢 You
              </p>
            </div>

            {/* Hospital list */}
            <div className="lg:col-span-2 flex flex-col gap-3">

              {/* Search bar */}
              {hospitals.length > 0 && (
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    className="input pl-9 pr-9"
                    type="text"
                    placeholder="Search hospitals by name…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Results count */}
              {hospitals.length > 0 && (
                <p className="text-xs text-slate-500 px-1">
                  {search
                    ? `${filteredHospitals.length} result${filteredHospitals.length !== 1 ? 's' : ''} for "${search}"`
                    : `${hospitals.length} hospitals found`}
                </p>
              )}

              {/* List */}
              <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="card p-8 text-center">
                    <div className="w-8 h-8 border-2 border-slate-700 border-t-teal-500 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Finding hospitals near you…</p>
                  </div>
                ) : filteredHospitals.length === 0 && search ? (
                  <div className="card p-8 text-center">
                    <Search className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No hospitals match "{search}"</p>
                    <button onClick={() => setSearch('')} className="text-teal-400 text-xs mt-2 hover:text-teal-300">Clear search</button>
                  </div>
                ) : (
                  filteredHospitals.map((h, i) => (
                    <button
                      key={h.id}
                      onClick={() => flyTo(h)}
                      className={`card text-left p-4 w-full transition-all ${selected?.id === h.id ? 'border-teal-500/50 bg-teal-500/5' : 'card-hover'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${h.emergency ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'}`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm leading-tight">{h.name}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />{typeLabel(h.type)}
                            </span>
                            <span className="text-xs text-teal-400 font-semibold flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              {h.dist < 1000 ? `${Math.round(h.dist)}m` : `${(h.dist / 1000).toFixed(1)}km`}
                            </span>
                            {h.emergency && <span className="text-xs text-red-400 font-semibold">🚨 Emergency</span>}
                          </div>
                          {h.address && <p className="text-xs text-slate-500 mt-1 truncate">{h.address}</p>}
                          <div className="flex gap-2 mt-3">
                            <button onClick={e => { e.stopPropagation(); openDirections(h) }}
                              className="flex items-center gap-1.5 text-xs bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 px-3 py-1.5 rounded-lg transition-colors border border-teal-500/20">
                              <Navigation className="w-3 h-3" /> Directions
                            </button>
                            {h.phone && (
                              <a href={`tel:${h.phone}`} onClick={e => e.stopPropagation()}
                                className="flex items-center gap-1.5 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg transition-colors border border-blue-500/20">
                                <Phone className="w-3 h-3" /> Call
                              </a>
                            )}
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name)}&center=${h.lat},${h.lng}`}
                              target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-3 py-1.5 rounded-lg transition-colors border border-slate-700">
                              <ExternalLink className="w-3 h-3" /> Maps
                            </a>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* Emergency note */}
        <div className="mt-6 bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-semibold text-sm">Medical Emergency?</p>
            <p className="text-red-400/70 text-xs mt-0.5">
              Call <span className="font-bold text-red-300">108</span> (Ambulance) or <span className="font-bold text-red-300">112</span> (National Emergency) immediately.
            </p>
          </div>
        </div>

      </main>
    </div>
  )
}
