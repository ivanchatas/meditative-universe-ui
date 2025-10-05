const BASE = 'https://api.nasa.gov'
const KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'

async function get(path, params = {}) {
  const url = new URL(BASE + path)
  url.searchParams.set('api_key', KEY)
  for (const k of Object.keys(params)) url.searchParams.set(k, params[k])
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`NASA API ${res.status}: ${res.statusText}`)
  return res.json()
}

export async function fetchAPOD() {
  return get('/planetary/apod')
}

export async function fetchEPIC() {
  // returns an array of images; we'll fetch the most recent
  return get('/EPIC/api/natural')
}

export async function fetchDONKI() {
  // recent solar events
  return get('/DONKI/notifications')
}

export async function fetchNEO() {
  return get('/neo/rest/v1/neo/browse')
}

export async function fetchExoplanets() {
  // Exoplanet Archive from Caltech/IPAC - public API, no key needed
  const url = 'https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?table=exoplanets&format=json&select=pl_name,pl_radj,pl_massj,pl_orbper,pl_orbsmax,st_teff,st_mass'
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Exoplanet API ${res.status}: ${res.statusText}`)
  const data = await res.json()
  // Return first 10 exoplanets for sonification
  return data.slice(0, 10)
}

export async function fetchMars() {
  return get('/mars-photos/api/v1/rovers/curiosity/photos', { sol: 1000 })
}

export default { fetchAPOD, fetchEPIC, fetchDONKI, fetchNEO, fetchExoplanets, fetchMars }
