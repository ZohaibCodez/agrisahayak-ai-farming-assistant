import { NextResponse } from 'next/server';

const OWM_KEY = process.env.OPENWEATHERMAP_API_KEY;

async function geocode(location: string) {
  if (!OWM_KEY) return null;
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${OWM_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || !data[0]) return null;
  return { lat: data[0].lat, lon: data[0].lon, name: data[0].name };
}

async function fetchWeatherByLatLon(lat: number, lon: number) {
  if (!OWM_KEY) return null;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.json();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { location, lat, lon } = body as { location?: string; lat?: number; lon?: number };

    let coords = { lat, lon };
    if ((!lat || !lon) && location) {
      const g = await geocode(location);
      if (g) coords = { lat: g.lat, lon: g.lon };
    }

    if (!coords?.lat || !coords?.lon) {
      // no coordinates available
      return NextResponse.json({ ok: true, weatherConditions: null, message: 'No coordinates available' }, { status: 200 });
    }

    const w = await fetchWeatherByLatLon(coords.lat as number, coords.lon as number);
    if (!w) return NextResponse.json({ ok: false, message: 'Failed to fetch weather' }, { status: 502 });

    const parts: string[] = [];
    if (w.weather && w.weather[0]) parts.push(`${w.weather[0].main}: ${w.weather[0].description}`);
    if (typeof w.main?.temp === 'number') parts.push(`Temp ${w.main.temp}°C`);
    if (typeof w.main?.humidity === 'number') parts.push(`Humidity ${w.main.humidity}%`);
    if (typeof w.wind?.speed === 'number') parts.push(`Wind ${w.wind.speed} m/s`);
    if (w.rain && w.rain['1h']) parts.push(`Rain (1h) ${w.rain['1h']} mm`);

    const weatherConditions = parts.join('; ');

    return NextResponse.json({ ok: true, weatherConditions, lat: coords.lat, lon: coords.lon, raw: w }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || String(err) }, { status: 500 });
  }
}
