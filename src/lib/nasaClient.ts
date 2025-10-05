// Use server-side key when available, or NEXT_PUBLIC_ for client-side.
const API_KEY = process.env.NASA_API_KEY || process.env.NEXT_PUBLIC_NASA_API_KEY || '';

type NasaResponse = { success: boolean; data?: any; error?: string };

async function fetchJson(url: string): Promise<NasaResponse> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const msg = `HTTP ${res.status} ${res.statusText} ${text}`;
      console.error(msg);
      return { success: false, error: msg };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    console.error('Fetch/parsing error', err);
    return { success: false, error: String(err?.message || err) };
  }
}

export async function getAPOD(): Promise<NasaResponse> {
  const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;
  return await fetchJson(url);
}

export async function getEPIC(): Promise<NasaResponse> {
  const url = `https://api.nasa.gov/EPIC/api/natural/images${API_KEY ? `?api_key=${API_KEY}` : ''}`;
  return await fetchJson(url);
}

export async function getDONKI(): Promise<NasaResponse> {
  const url = `https://api.nasa.gov/DONKI/notifications?api_key=${API_KEY}`;
  return await fetchJson(url);
}

export async function getNEO(): Promise<NasaResponse> {
  const url = `https://api.nasa.gov/neo/rest/v1/feed/today?api_key=${API_KEY}`;
  return await fetchJson(url);
}

export async function getExoplanets(): Promise<NasaResponse> {
  const url =
    'https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+pl_name,pl_orbper,pl_rade,pl_bmasse,st_teff+from+pscomppars&format=json';
  return await fetchJson(url);
}

export async function getMarsPhotos(): Promise<NasaResponse> {
  const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000${API_KEY ? `&api_key=${API_KEY}` : ''}`;
  return await fetchJson(url);
}

// Helper: map common source names to functions
export async function fetchNasaData(source: string): Promise<NasaResponse> {
  const key = (source || '').toLowerCase();
  switch (key) {
    case 'apod':
      return await getAPOD();
    case 'epic':
      return await getEPIC();
    case 'donki':
      return await getDONKI();
    case 'neo':
      return await getNEO();
    case 'exoplanet':
    case 'exoplanet archive':
      return await getExoplanets();
    case 'mars':
    case 'mars rover':
    case 'marsrover':
      return await getMarsPhotos();
    default:
      return { success: false, error: `Unknown source: ${source}` };
  }
}

// Backwards-compatible name used earlier in the app
export const fetchSource = fetchNasaData;
