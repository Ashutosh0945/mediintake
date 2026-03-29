import { useState, useEffect, useRef } from 'react'
import Navbar from '../../components/Navbar'
import MobileNav from '../../components/MobileNav'
import { MapPin, Phone, Navigation, AlertCircle, RefreshCw, ExternalLink, Building2, Search, X, Clock } from 'lucide-react'

export default function PharmacyFinder() {
  const [location, setLocation] = useState(null)
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [radius, setRadius] = useState(2000)
  const [search, setSearch] = useState('')
  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'; link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script')
      script.id = 'leaflet-js'; script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => { if (location) initMap(location) }
      document.head.appendChild(script)
    }
    getLocation()
  }, [])

  useEffect(() => { if (location) { fetchPharmacies(location); setTimeout(() => initMap(location), 500) } }, [location, radius])
  useEffect(() => { if (location && pharmacies.length > 0) updateMarkers() }, [pharmacies])

  function getLocation() {
    setLocating(true); setError('')
    if (!navigator.geolocation) { setError('Geolocation not supported.'); setLocating(false); return }
    navigator.geolocation.getCurrentPosition(
      pos => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false) },
      () => { setError('Could not get your location. Please allow location access.'); setLocating(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function fetchPharmacies(loc) {
    setLoading(true); setError('')
    try {
      const query = `[out:json][timeout:60];(node["amenity"="pharmacy"](around:${radius},${loc.lat},${loc.lng});way["amenity"="pharmacy"](around:${radius},${loc.lat},${loc.lng});node["shop"="chemist"](around:${radius},${loc.lat},${loc.lng}););out body center;`
      let res = null
      const mirrors = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
      ]
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
      const results = data.elements.filter(el => el.tags?.name).map(el => {
        const lat = el.lat || el.center?.lat
        const lng = el.lon || el.center?.lon
        const dist = haversine(loc.lat, loc.lng, lat, lng)
        return {
          id: el.id, name: el.tags.name,
          phone: el.tags.phone || el.tags['contact:phone'] || null,
          opening_hours: el.tags.opening_hours || null,
          address: [el.tags['addr:street'], el.tags['addr:city']].filter(Boolean).join(', ') || null,
          lat, lng, dist,
        }
      }).sort((a, b) => a.dist - b.dist).slice(0, 20)
      setPharmacies(results)
      if (results.length === 0) setError(`No pharmacies found within ${radius/1000}km. Try increasing the radius.`)
    } catch { setError('Map service timed out. Try a smaller radius or try again in 30 seconds.') }
    setLoading(false)
  }

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000, dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

  function initMap(loc) {
    const L = window.L; if (!L || !mapRef.current) return
    if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null }
    const map = L.map(mapRef.current, { zoomControl: true }).setView([loc.lat, loc.lng], 15)
    leafletMap.current = map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map)
    const userIcon = L.divIcon({ html: `<div style="width:14px;height:14px;background:#22D3EE;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(34,211,238,0.3)"></div>`, className: '', iconAnchor: [7,7] })
    L.marker([loc.lat, loc.lng], { icon: userIcon }).addTo(map).bindPopup('<b>📍 You are here</b>')
    updateMarkers()
  }

  function updateMarkers() {
    const L = window.L; if (!L || !leafletMap.current) return
    markersRef.current.forEach(m => m.remove()); markersRef.current = []
    pharmacies.forEach((p, i) => {
      if (!p.lat || !p.lng) return
      const icon = L.divIcon({ html: `<div style="background:#10B981;color:white;border:2px solid white;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.4);">💊</div>`, className: '', iconAnchor: [13,13] })
      const marker = L.marker([p.lat, p.lng], { icon }).addTo(leafletMap.current).bindPopup(`<b>${p.name}</b><br/>${(p.dist/1000).toFixed(1)} km away`)
      marker.on('click', () => setSelected(p)); markersRef.current.push(marker)
    })
  }

  function flyTo(p) { setSelected(p); if (leafletMap.current) leafletMap.current.flyTo([p.lat, p.lng], 17, { duration: 1 }) }
  function openDirections(p) { window.open(`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=driving`, '_blank') }

  const filtered = pharmacies.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))

  const s = { page: { minHeight: '100vh', background: '#020617', paddingBottom: '5rem' }, card: { background: 'rgba(2,26,60,0.85)', border: '1.5px solid rgba(8,145,178,0.22)', borderRadius: '18px' } }

  return (
    <div style={s.page}>
      <Navbar />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }} className="animate-slide-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg,#059669,#10B981)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(16,185,129,0.4)', fontSize: '22px' }}>💊</div>
            <div>
              <h1 className="section-title">Pharmacy Finder</h1>
              <p style={{ fontSize: '13px', color: 'rgba(103,232,249,0.45)', marginTop: '2px' }}>
                {location ? `Showing pharmacies within ${radius/1000}km` : 'Detecting your location…'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select className="input" style={{ width: 'auto', padding: '8px 12px', fontSize: '13px' }} value={radius} onChange={e => setRadius(Number(e.target.value))}>
              <option value={1000}>1 km</option>
              <option value={2000}>2 km</option>
              <option value={3000}>3 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
            </select>
            <button onClick={getLocation} disabled={locating} className="btn-secondary" style={{ padding: '9px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw style={{ width: '13px', height: '13px' }} className={locating ? 'animate-spin' : ''} />
              {locating ? 'Locating…' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#FCA5A5', fontSize: '13px', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle style={{ width: '15px', height: '15px', flexShrink: 0 }} />{error}</div>}

        {location && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px' }}>
            <div>
              <div ref={mapRef} style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1.5px solid rgba(8,145,178,0.22)', height: '500px' }} />
              <p style={{ fontSize: '11px', color: 'rgba(103,232,249,0.3)', marginTop: '6px', textAlign: 'center' }}>💊 Pharmacies / Chemists · 🟢 You</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pharmacies.length > 0 && (
                <div style={{ position: 'relative' }}>
                  <Search style={{ width: '14px', height: '14px', color: 'rgba(103,232,249,0.4)', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input className="input" style={{ paddingLeft: '36px', paddingRight: search ? '36px' : '14px', fontSize: '13px' }} placeholder="Search pharmacies…" value={search} onChange={e => setSearch(e.target.value)} />
                  {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(103,232,249,0.4)', display: 'flex' }}><X style={{ width: '14px', height: '14px' }} /></button>}
                </div>
              )}
              {pharmacies.length > 0 && <p style={{ fontSize: '11px', color: 'rgba(103,232,249,0.35)', paddingLeft: '2px' }}>{filtered.length} {search ? `results for "${search}"` : 'pharmacies found'}</p>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '430px', overflowY: 'auto', paddingRight: '2px' }}>
                {loading ? (
                  <div style={{ ...s.card, padding: '24px', textAlign: 'center' }}>
                    <div style={{ width: '28px', height: '28px', border: '3px solid rgba(8,145,178,0.15)', borderTopColor: '#22D3EE', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    <p style={{ fontSize: '12px', color: 'rgba(103,232,249,0.35)' }}>Finding pharmacies…</p>
                  </div>
                ) : filtered.length === 0 && search ? (
                  <div style={{ ...s.card, padding: '24px', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: 'rgba(103,232,249,0.3)' }}>No results for "{search}"</p>
                    <button onClick={() => setSearch('')} style={{ fontSize: '11px', color: '#22D3EE', background: 'none', border: 'none', cursor: 'pointer', marginTop: '6px' }}>Clear</button>
                  </div>
                ) : filtered.map((p, i) => (
                  <button key={p.id} onClick={() => flyTo(p)} style={{ ...s.card, padding: '14px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', border: `1.5px solid ${selected?.id === p.id ? 'rgba(16,185,129,0.5)' : 'rgba(8,145,178,0.18)'}`, background: selected?.id === p.id ? 'rgba(16,185,129,0.06)' : 'rgba(2,26,60,0.85)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>💊</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#A5F3FC' }}>{p.name}</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '3px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: '#34D399', fontWeight: 600 }}>
                            {p.dist < 1000 ? `${Math.round(p.dist)}m` : `${(p.dist/1000).toFixed(1)}km`}
                          </span>
                          {p.opening_hours && <span style={{ fontSize: '10px', color: 'rgba(103,232,249,0.4)', display: 'flex', alignItems: 'center', gap: '3px' }}><Clock style={{ width: '10px', height: '10px' }} />{p.opening_hours.slice(0,20)}</span>}
                        </div>
                        {p.address && <p style={{ fontSize: '10px', color: 'rgba(103,232,249,0.3)', marginTop: '2px' }}>{p.address}</p>}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                          <button onClick={e => { e.stopPropagation(); openDirections(p) }} style={{ fontSize: '10px', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', color: '#67E8F9', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Navigation style={{ width: '10px', height: '10px' }} /> Directions
                          </button>
                          {p.phone && <a href={`tel:${p.phone}`} onClick={e => e.stopPropagation()} style={{ fontSize: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34D399', padding: '4px 8px', borderRadius: '6px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone style={{ width: '10px', height: '10px' }} /> Call
                          </a>}
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name)}&center=${p.lat},${p.lng}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: '10px', background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.2)', color: 'rgba(103,232,249,0.6)', padding: '4px 8px', borderRadius: '6px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ExternalLink style={{ width: '10px', height: '10px' }} /> Maps
                          </a>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '16px', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle style={{ width: '16px', height: '16px', color: '#FCA5A5', flexShrink: 0 }} />
          <p style={{ fontSize: '12px', color: 'rgba(252,165,165,0.7)' }}>
            Medical Emergency? Call <strong style={{ color: '#FCA5A5' }}>108</strong> (Ambulance) or <strong style={{ color: '#FCA5A5' }}>112</strong> immediately.
          </p>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
