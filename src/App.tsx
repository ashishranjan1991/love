import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  Heart,
  Sparkles,
  Share2,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Coffee,
  Utensils,
  Smartphone,
  Edit3,
  Sun,
  CloudRain,
  Umbrella,
  Glasses,
  CloudSun,
  Cloud,
  MapPin,
  RefreshCw,
  LocateFixed,
  Navigation
} from 'lucide-react';

interface WeatherForecastData {
  date: string;
  tempMaxC: number;
  tempMinC: number;
  tempMaxF: number;
  tempMinF: number;
  weatherCode: number;
  precipProb: number;
  condition: string;
  icon: string;
  advice: 'umbrella' | 'sunglasses' | 'both' | 'mild';
  adviceTitle: string;
  adviceMessage: string;
  cityName: string;
  countryName?: string;
  isApproximate?: boolean;
}

function decodeWeatherCode(code: number, precipProb: number): {
  condition: string;
  icon: string;
  advice: 'umbrella' | 'sunglasses' | 'both' | 'mild';
  adviceTitle: string;
  adviceMessage: string;
} {
  // WMO Code decoding
  if (code === 0) {
    return {
      condition: 'Sunny & Clear',
      icon: '☀️',
      advice: 'sunglasses',
      adviceTitle: 'Bring Sunglasses! 🕶️',
      adviceMessage: 'Clear, sunny skies expected! Rock your favorite shades and enjoy the sunshine together 😎✨',
    };
  }
  if (code === 1 || code === 2) {
    if (precipProb >= 35) {
      return {
        condition: 'Partly Sunny with Showers',
        icon: '⛅',
        advice: 'both',
        adviceTitle: 'Bring Both Sunglasses & Umbrella! 🕶️☔',
        adviceMessage: `Sun with a ${precipProb}% chance of passing showers — pack both to stay completely prepared!`,
      };
    }
    return {
      condition: 'Partly Cloudy & Pleasant',
      icon: '🌤️',
      advice: 'sunglasses',
      adviceTitle: 'Sunglasses Recommended! 🕶️',
      adviceMessage: 'Bright, comfortable outdoor date weather. Sunglasses are recommended! 😎',
    };
  }
  if (code === 3) {
    if (precipProb >= 35) {
      return {
        condition: 'Overcast with Chance of Drizzle',
        icon: '☁️',
        advice: 'umbrella',
        adviceTitle: 'Pack a Compact Umbrella! ☔',
        adviceMessage: `Cloudy with a ${precipProb}% chance of rain. Bring an umbrella just to be safe!`,
      };
    }
    return {
      condition: 'Overcast & Mild',
      icon: '☁️',
      advice: 'mild',
      adviceTitle: 'Pleasant & Mild Weather 🌤️',
      adviceMessage: 'Comfortable cloudy skies with low rain chance — no umbrella or heavy gear needed!',
    };
  }
  if (code >= 45 && code <= 48) {
    return {
      condition: 'Misty / Foggy',
      icon: '🌫️',
      advice: 'mild',
      adviceTitle: 'Moody & Atmospheric 🧣',
      adviceMessage: 'Misty atmospheric vibe! A light jacket or scarf is great for walking together.',
    };
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      condition: 'Rain & Showers',
      icon: '🌧️',
      advice: 'umbrella',
      adviceTitle: 'Pack an Umbrella! ☔',
      adviceMessage: `Rain forecasted (${precipProb}% chance). Bring a shared umbrella — perfect excuse to walk close 💕`,
    };
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return {
      condition: 'Snow / Winter Flurries',
      icon: '❄️',
      advice: 'umbrella',
      adviceTitle: 'Bundle Up & Bring an Umbrella! ❄️🧣',
      adviceMessage: 'Snow and winter flurries expected! Dress warm, grab an umbrella, and warm up with coffee/tea ☕',
    };
  }
  if (code >= 95) {
    return {
      condition: 'Thunderstorm',
      icon: '⛈️',
      advice: 'umbrella',
      adviceTitle: 'Thunderstorm Alert: Umbrella Essential! ⚡☔',
      adviceMessage: 'Thunderstorms and rain likely. Definitely bring an umbrella or plan cozy indoor fun!',
    };
  }
  return {
    condition: 'Pleasant Weather',
    icon: '✨',
    advice: precipProb >= 35 ? 'umbrella' : 'sunglasses',
    adviceTitle: precipProb >= 35 ? 'Pack an Umbrella! ☔' : 'Sunglasses Ready! 🕶️',
    adviceMessage: precipProb >= 35
      ? 'Chances of rain detected — carry an umbrella just in case! ☔'
      : 'Mild and clear conditions — sunglasses are a great touch! 😎',
  };
}

interface TimeOption {
  value: string;
  display: string;
  type: 'morning' | 'evening';
  label: string;
}

const MORNING_TIMES: TimeOption[] = [
  { value: '08:00', display: '8:00 AM', type: 'morning', label: '8:00 AM — 8am? bold choice. I respect the commitment 😅' },
  { value: '09:00', display: '9:00 AM', type: 'morning', label: '9:00 AM — this is the right answer tbh ☕' },
  { value: '10:00', display: '10:00 AM', type: 'morning', label: "10:00 AM — I'm already having coffee withdrawal symptoms ☕😬" },
  { value: '11:00', display: '11:00 AM', type: 'morning', label: '11:00 AM — are we eating dinner or doing netflix & chill? 🤔' },
];

const EVENING_TIMES: TimeOption[] = [
  { value: '17:00', display: '5:00 PM', type: 'evening', label: '5:00 PM — we eating with the retirees 👴' },
  { value: '18:00', display: '6:00 PM', type: 'evening', label: '6:00 PM — this is the right answer tbh ✨' },
  { value: '19:00', display: '7:00 PM', type: 'evening', label: "7:00 PM — you're making me hungry already 🍽️" },
  { value: '20:00', display: '8:00 PM', type: 'evening', label: '8:00 PM — we eating dinner or breakfast? 🌙' },
];

const MORNING_OPTIONS = [
  { icon: '☕🐕', label: 'Coffee & park walk with my 2 dogs' },
  { icon: '☕🌊', label: 'Coffee & coastal walk with my 2 dogs' },
  { icon: '☕🍳', label: 'Coffee, breaky & park walk with my 2 dogs' },
  { icon: '☕♟️', label: 'Coffee, chess & park walk with my 2 dogs' },
  { icon: '☕🏍️', label: 'Coffee & motorbike ride together' },
  { icon: '☕😈', label: 'One of the above... and netflix & chill. YOLO.' },
];

const EVENING_OPTIONS = [
  { icon: '🍕', label: 'Pizza' },
  { icon: '🍣', label: 'Sushi' },
  { icon: '🍔', label: 'Burgers' },
  { icon: '🍝', label: 'Pasta' },
  { icon: '🌮', label: 'Tacos' },
  { icon: '🍜', label: 'Ramen' },
];

const NO_BUTTON_TEXTS = [
  'no... 🙈',
  'are you sure? 🥺',
  'misclick right? 🤨',
  'wrong button silly 🤭',
  "can't catch me! 🏃💨",
  "error 404: 'no' not found 🤖",
  'the button is shy 🙈',
  'think again! 💖',
  'just click YES already! 😂',
];

export default function App() {
  // Navigation screen states: 1 (Landing), 2 (Reaction), 3 (Date/Time), 4 ('4a' | '4b'), 5 (Contact), 6 (Confirmation)
  const [currentScreen, setCurrentScreen] = useState<string>('screen-1');

  // Customization via URL or Creator modal
  const [crushName, setCrushName] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [showCreatorModal, setShowCreatorModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Proposal State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDateDisplay, setSelectedDateDisplay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<TimeOption | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [customChoice, setCustomChoice] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [specialNote, setSpecialNote] = useState<string>('');

  // Weather Forecast State for Screen 6
  const [weatherData, setWeatherData] = useState<WeatherForecastData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherCity, setWeatherCity] = useState<string>(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const raw = tz.split('/')[1]?.replace(/_/g, ' ');
      return raw || 'New York';
    } catch {
      return 'New York';
    }
  });
  const [editingCity, setEditingCity] = useState<boolean>(false);
  const [cityInput, setCityInput] = useState<string>('');
  const [detectingLocation, setDetectingLocation] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Fetch weather forecast directly for coordinates (latitude & longitude)
  const fetchWeatherForCoords = async (
    lat: number,
    lon: number,
    targetDate: string,
    cityName: string,
    countryName?: string
  ) => {
    if (!targetDate) return;
    setWeatherLoading(true);
    setWeatherError(null);

    try {
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=16`;
      const forecastRes = await fetch(forecastUrl);
      const forecastJson = await forecastRes.json();

      if (!forecastJson.daily || !forecastJson.daily.time) {
        throw new Error('Unable to retrieve weather forecast for current location.');
      }

      const dailyTimes: string[] = forecastJson.daily.time;
      let dateIndex = dailyTimes.indexOf(targetDate);
      let isApproximate = false;

      if (dateIndex === -1) {
        dateIndex = dailyTimes.length - 1;
        isApproximate = true;
      }

      const code = forecastJson.daily.weather_code[dateIndex] ?? 0;
      const maxC = Math.round(forecastJson.daily.temperature_2m_max[dateIndex] ?? 22);
      const minC = Math.round(forecastJson.daily.temperature_2m_min[dateIndex] ?? 14);
      const maxF = Math.round(maxC * 1.8 + 32);
      const minF = Math.round(minC * 1.8 + 32);
      const precip = forecastJson.daily.precipitation_probability_max[dateIndex] ?? 0;

      const decoded = decodeWeatherCode(code, precip);

      setWeatherData({
        date: targetDate,
        tempMaxC: maxC,
        tempMinC: minC,
        tempMaxF: maxF,
        tempMinF: minF,
        weatherCode: code,
        precipProb: precip,
        condition: decoded.condition,
        icon: decoded.icon,
        advice: decoded.advice,
        adviceTitle: decoded.adviceTitle,
        adviceMessage: decoded.adviceMessage,
        cityName,
        countryName,
        isApproximate,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not fetch weather forecast';
      setWeatherError(msg);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Detect current location via browser GPS / Geolocation with IP fallback
  const detectCurrentLocation = async (targetDateOverride?: string) => {
    const tDate = targetDateOverride || selectedDate;
    if (!tDate) return;
    setDetectingLocation(true);
    setLocationStatus('Detecting your GPS location...');

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Reverse geocode with Nominatim OpenStreetMap
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { 'Accept-Language': 'en' } }
            );
            const geoData = await geoRes.json();
            const addr = geoData.address || {};
            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.suburb ||
              addr.municipality ||
              addr.county ||
              'Your Location';
            const country = addr.country || '';
            setWeatherCity(city);
            setLocationStatus(`📍 Detected: ${city}${country ? `, ${country}` : ''}`);
            await fetchWeatherForCoords(latitude, longitude, tDate, city, country);
          } catch {
            setWeatherCity('Current Location');
            setLocationStatus('📍 Location detected');
            await fetchWeatherForCoords(latitude, longitude, tDate, 'Current Location');
          } finally {
            setDetectingLocation(false);
          }
        },
        async (geoErr) => {
          console.warn('Browser GPS permission skipped or timed out, trying IP location:', geoErr);
          // Fallback to IP geolocation
          try {
            const ipRes = await fetch('https://freeipapi.com/api/json/');
            const ipData = await ipRes.json();
            if (ipData && ipData.cityName && ipData.latitude && ipData.longitude) {
              setWeatherCity(ipData.cityName);
              setLocationStatus(`📍 Detected via IP: ${ipData.cityName}${ipData.countryName ? `, ${ipData.countryName}` : ''}`);
              await fetchWeatherForCoords(
                ipData.latitude,
                ipData.longitude,
                tDate,
                ipData.cityName,
                ipData.countryName
              );
            } else {
              setLocationStatus(null);
              await fetchWeatherForDate(tDate, weatherCity);
            }
          } catch {
            setLocationStatus(null);
            await fetchWeatherForDate(tDate, weatherCity);
          } finally {
            setDetectingLocation(false);
          }
        },
        { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false }
      );
    } else {
      // Fallback to IP
      try {
        const ipRes = await fetch('https://freeipapi.com/api/json/');
        const ipData = await ipRes.json();
        if (ipData && ipData.cityName && ipData.latitude && ipData.longitude) {
          setWeatherCity(ipData.cityName);
          setLocationStatus(`📍 Detected via IP: ${ipData.cityName}`);
          await fetchWeatherForCoords(
            ipData.latitude,
            ipData.longitude,
            tDate,
            ipData.cityName,
            ipData.countryName
          );
        } else {
          await fetchWeatherForDate(tDate, weatherCity);
        }
      } catch {
        await fetchWeatherForDate(tDate, weatherCity);
      } finally {
        setDetectingLocation(false);
      }
    }
  };

  // Fetch weather forecast from Open-Meteo for selectedDate
  const fetchWeatherForDate = async (targetDate: string, city: string) => {
    if (!targetDate) return;
    setWeatherLoading(true);
    setWeatherError(null);

    try {
      // 1. Geocode the city
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en`;
      const geoRes = await fetch(geoUrl);
      const geoJson = await geoRes.json();

      if (!geoJson.results || geoJson.results.length === 0) {
        throw new Error(`Could not find location "${city}". Try another city.`);
      }

      const location = geoJson.results[0];
      const { latitude, longitude, name: foundCity, country } = location;

      // 2. Fetch daily weather forecast
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=16`;
      const forecastRes = await fetch(forecastUrl);
      const forecastJson = await forecastRes.json();

      if (!forecastJson.daily || !forecastJson.daily.time) {
        throw new Error('Unable to retrieve weather forecast data.');
      }

      const dailyTimes: string[] = forecastJson.daily.time;
      let dateIndex = dailyTimes.indexOf(targetDate);
      let isApproximate = false;

      // If target date is further ahead than 16-day window, use closest available day as seasonal estimate
      if (dateIndex === -1) {
        dateIndex = dailyTimes.length - 1;
        isApproximate = true;
      }

      const code = forecastJson.daily.weather_code[dateIndex] ?? 0;
      const maxC = Math.round(forecastJson.daily.temperature_2m_max[dateIndex] ?? 22);
      const minC = Math.round(forecastJson.daily.temperature_2m_min[dateIndex] ?? 14);
      const maxF = Math.round(maxC * 1.8 + 32);
      const minF = Math.round(minC * 1.8 + 32);
      const precip = forecastJson.daily.precipitation_probability_max[dateIndex] ?? 0;

      const decoded = decodeWeatherCode(code, precip);

      setWeatherData({
        date: targetDate,
        tempMaxC: maxC,
        tempMinC: minC,
        tempMaxF: maxF,
        tempMinF: minF,
        weatherCode: code,
        precipProb: precip,
        condition: decoded.condition,
        icon: decoded.icon,
        advice: decoded.advice,
        adviceTitle: decoded.adviceTitle,
        adviceMessage: decoded.adviceMessage,
        cityName: foundCity,
        countryName: country,
        isApproximate,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not fetch weather forecast';
      setWeatherError(msg);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Trigger weather fetch when entering screen 6 or changing city/date
  useEffect(() => {
    if (currentScreen === 'screen-6' && selectedDate) {
      if (!locationStatus) {
        // Automatically attempt current location detection
        detectCurrentLocation(selectedDate);
      } else {
        fetchWeatherForDate(selectedDate, weatherCity);
      }
    }
  }, [currentScreen, selectedDate, weatherCity]);

  // No Button Position & Dodge count
  const [noCount, setNoCount] = useState<number>(0);
  const [noButtonPos, setNoButtonPos] = useState<{ x: number; y: number } | null>(null);
  const [noButtonInitialPlaced, setNoButtonInitialPlaced] = useState<boolean>(false);
  const yesButtonRef = useRef<HTMLButtonElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const [escapeNotice, setEscapeNotice] = useState<string | null>(null);

  // Play subtle cute audio chime
  const playChime = (type: 'pop' | 'success' | 'dodge') => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'dodge') {
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === 'pop') {
        osc.frequency.setValueAtTime(520, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
      } else if (type === 'success') {
        const now = audioCtx.currentTime;
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.5, now + 0.3); // C6
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
        osc.start(now);
        osc.stop(now + 0.55);
      }
    } catch {
      // Audio not supported or blocked, silently continue
    }
  };

  // Trigger standard confetti burst for Screen 1
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f4a7b9', '#c9b8e8', '#ffd166', '#ff6b8b', '#ffffff'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#f4a7b9', '#c9b8e8', '#ff8da1'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#f4a7b9', '#c9b8e8', '#ff8da1'],
        });
      }, 250);
    } catch {
      // Confetti fallback
    }
  };

  // Intense multi-stage mega celebration confetti effect for Screen 6
  const triggerMegaCelebrationConfetti = () => {
    try {
      const colors = ['#f4a7b9', '#c9b8e8', '#ffd166', '#ff4d6d', '#ff758f', '#ffffff', '#e0aaff', '#ffc6ff'];

      // Stage 1 (0ms): Supernova center cannon burst
      confetti({
        particleCount: 130,
        spread: 110,
        origin: { y: 0.65 },
        startVelocity: 52,
        colors,
        disableForReducedMotion: true,
      });

      // Stage 2 (+220ms): Dual angled crossfire cannons from left and right corners
      setTimeout(() => {
        confetti({
          particleCount: 85,
          angle: 60,
          spread: 70,
          origin: { x: 0.02, y: 0.8 },
          startVelocity: 60,
          colors,
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: 85,
          angle: 120,
          spread: 70,
          origin: { x: 0.98, y: 0.8 },
          startVelocity: 60,
          colors,
          disableForReducedMotion: true,
        });
      }, 220);

      // Stage 3 (+550ms): High-altitude radial skyburst
      setTimeout(() => {
        confetti({
          particleCount: 110,
          spread: 160,
          origin: { x: 0.5, y: 0.28 },
          startVelocity: 40,
          scalar: 1.25,
          ticks: 350,
          colors,
          disableForReducedMotion: true,
        });
      }, 550);

      // Stage 4 (+850ms to 2800ms): Continuous celebratory cascading fountains
      const startTime = Date.now();
      const duration = 2200;
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed > duration) {
          clearInterval(interval);
          return;
        }

        // Alternating floating fountain cannons
        confetti({
          particleCount: 30,
          angle: 55 + Math.random() * 20,
          spread: 60,
          origin: { x: 0.05 + Math.random() * 0.15, y: 0.75 },
          startVelocity: 42 + Math.random() * 15,
          colors,
          disableForReducedMotion: true,
        });

        confetti({
          particleCount: 30,
          angle: 105 + Math.random() * 20,
          spread: 60,
          origin: { x: 0.8 + Math.random() * 0.15, y: 0.75 },
          startVelocity: 42 + Math.random() * 15,
          colors,
          disableForReducedMotion: true,
        });
      }, 250);
    } catch {
      // Confetti fallback
    }
  };

  // Read URL query params on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to') || params.get('name') || '';
    const from = params.get('from') || '';
    if (to) setCrushName(to);
    if (from) setSenderName(from);
  }, []);

  // Position the No button initially next to the YES button
  useEffect(() => {
    if (currentScreen === 'screen-1' && yesButtonRef.current && !noButtonInitialPlaced) {
      const updateInitialPos = () => {
        if (!yesButtonRef.current) return;
        const rect = yesButtonRef.current.getBoundingClientRect();
        const isDesktop = window.innerWidth >= 640;
        if (isDesktop) {
          setNoButtonPos({
            x: Math.max(16, rect.left - 130),
            y: rect.top + (rect.height - 40) / 2,
          });
        } else {
          setNoButtonPos({
            x: rect.left + (rect.width - 110) / 2,
            y: rect.bottom + 18,
          });
        }
        setNoButtonInitialPlaced(true);
      };

      const timer = setTimeout(updateInitialPos, 150);
      window.addEventListener('resize', updateInitialPos);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateInitialPos);
      };
    }
  }, [currentScreen, noButtonInitialPlaced]);

  // Flee logic for No button
  const moveNoButton = () => {
    playChime('dodge');
    setNoCount((prev) => prev + 1);

    const btnWidth = 120;
    const btnHeight = 44;
    const margin = 24;
    const maxX = Math.max(margin, window.innerWidth - btnWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - btnHeight - margin);

    // Pick random position
    const newX = Math.floor(Math.random() * (maxX - margin)) + margin;
    const newY = Math.floor(Math.random() * (maxY - margin)) + margin;

    setNoButtonPos({ x: newX, y: newY });

    const notices = [
      'Whoops, missed it! 🏃‍♀️',
      'Too slow! 💨',
      'Nice try haha! 🤭',
      'The button escaped! ✨',
      'It only wants YES! 💕',
    ];
    setEscapeNotice(notices[Math.floor(Math.random() * notices.length)]);
    setTimeout(() => setEscapeNotice(null), 1200);
  };

  // Cursor proximity check
  useEffect(() => {
    if (currentScreen !== 'screen-1' || !noButtonRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!noButtonRef.current) return;
      const rect = noButtonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);

      // If mouse gets within 90 pixels, run away!
      if (distance < 90) {
        moveNoButton();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [currentScreen, noCount]);

  // Handle YES click
  const handleYes = () => {
    playChime('success');
    triggerConfetti();
    setCurrentScreen('screen-2');
  };

  // Quick Date suggestions
  const getQuickDates = () => {
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const getNextDayOfWeek = (dayOfWeek: number, weeksAhead = 0) => {
      const d = new Date();
      const diff = (dayOfWeek + 7 - d.getDay()) % 7;
      const addDays = diff === 0 ? 7 : diff;
      d.setDate(d.getDate() + addDays + weeksAhead * 7);
      return d;
    };

    const thisFriday = getNextDayOfWeek(5, 0);
    const thisSaturday = getNextDayOfWeek(6, 0);
    const nextFriday = getNextDayOfWeek(5, 1);
    const nextSaturday = getNextDayOfWeek(6, 1);

    const formatObj = (d: Date, label: string) => {
      const iso = d.toISOString().split('T')[0];
      const display = `${label} (${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()})`;
      return { iso, display, label };
    };

    return [
      formatObj(thisFriday, 'This Friday'),
      formatObj(thisSaturday, 'This Saturday'),
      formatObj(nextFriday, 'Next Friday'),
      formatObj(nextSaturday, 'Next Saturday'),
    ];
  };

  // Submit appointment & lock it in
  const handleLockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    playChime('success');
    setCurrentScreen('screen-6');
    // Multi-stage intense celebratory confetti explosion
    triggerMegaCelebrationConfetti();
  };

  // Generate Google Calendar Link
  const getGoogleCalendarUrl = () => {
    if (!selectedDate || !selectedTime) return '#';
    const dateFormatted = selectedDate.replace(/-/g, '');
    const startTimeFormatted = selectedTime.value.replace(':', '') + '00';
    // 2 hours duration
    const [hourStr, minStr] = selectedTime.value.split(':');
    const endHour = (parseInt(hourStr, 10) + 2) % 24;
    const endTimeFormatted = `${String(endHour).padStart(2, '0')}${minStr}00`;

    const startDateTime = `${dateFormatted}T${startTimeFormatted}`;
    const endDateTime = `${dateFormatted}T${endTimeFormatted}`;

    const title = encodeURIComponent(`Date with ${crushName || 'Special Someone'} 💕`);
    const details = encodeURIComponent(
      `Date planned with Say Yes or Else!\nActivity / Food: ${selectedChoice || customChoice || 'Surprise Date'}\nNote: ${specialNote || 'Instructions will follow via mobile'}\nCan't wait! 🎉`
    );
    const location = encodeURIComponent(selectedChoice || 'Secret Romantic Spot');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${endDateTime}&details=${details}&location=${location}`;
  };

  // Generate .ICS Calendar File download
  const downloadIcsFile = () => {
    if (!selectedDate || !selectedTime) return;
    const dateFormatted = selectedDate.replace(/-/g, '');
    const startTimeFormatted = selectedTime.value.replace(':', '') + '00';
    const [hourStr, minStr] = selectedTime.value.split(':');
    const endHour = (parseInt(hourStr, 10) + 2) % 24;
    const endTimeFormatted = `${String(endHour).padStart(2, '0')}${minStr}00`;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Say Yes or Else//Date Planner//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}@say-yes-or-else.app
DTSTAMP:${dateFormatted}T000000Z
DTSTART:${dateFormatted}T${startTimeFormatted}
DTEND:${dateFormatted}T${endTimeFormatted}
SUMMARY:Date with ${crushName || 'Special Someone'} 💕
DESCRIPTION:Activity: ${selectedChoice || customChoice || 'Surprise Date'}\\nPhone: ${phoneNumber}\\nPS: Normal people text. I made a website for you.
LOCATION:${selectedChoice || 'Secret Romantic Spot'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'our_date.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp share link
  const getWhatsAppShareUrl = () => {
    const text = encodeURIComponent(
      `Hey! I said YES to our date on ${selectedDateDisplay || selectedDate} at ${selectedTime?.display || ''} for ${selectedChoice || customChoice}! See you there! 💕🐾`
    );
    return `https://wa.me/?text=${text}`;
  };

  // Share custom link creator
  const copyCustomLink = () => {
    const url = new URL(window.location.origin + window.location.pathname);
    if (crushName) url.searchParams.set('to', crushName);
    if (senderName) url.searchParams.set('from', senderName);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#fdf6f0] text-[#3d1a1a] flex flex-col justify-between items-center px-4 py-8 overflow-hidden select-none">
      {/* Floating Ambient Sakura & Heart Particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {[
          { symbol: '🌸', left: '8%', delay: '0s', duration: '12s', size: '1.2rem' },
          { symbol: '💕', left: '22%', delay: '4s', duration: '15s', size: '1rem' },
          { symbol: '✨', left: '38%', delay: '1s', duration: '14s', size: '0.9rem' },
          { symbol: '🌸', left: '52%', delay: '6s', duration: '13s', size: '1.4rem' },
          { symbol: '💗', left: '68%', delay: '2s', duration: '16s', size: '1.1rem' },
          { symbol: '🌷', left: '84%', delay: '5s', duration: '14s', size: '1.3rem' },
          { symbol: '❤️', left: '94%', delay: '3s', duration: '11s', size: '0.8rem' },
        ].map((item, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: item.left,
              animationDelay: item.delay,
              animationDuration: item.duration,
              fontSize: item.size,
            }}
          >
            {item.symbol}
          </span>
        ))}
      </div>

      {/* Atmospheric Background Watermark Text */}
      <div
        className="fixed inset-0 flex items-center justify-between px-6 pointer-events-none z-0 opacity-4 overflow-hidden select-none text-[#3d1a1a]"
        aria-hidden="true"
      >
        <span className="font-serif font-black text-7xl md:text-9xl tracking-widest uppercase rotate-90 md:rotate-0 -ml-16 md:ml-0">
          WAIT
        </span>
        <span className="font-serif font-black text-7xl md:text-9xl tracking-widest uppercase -rotate-90 md:rotate-0 -mr-16 md:mr-0">
          ACTUALLY
        </span>
      </div>

      {/* Top Bar with Cute Customizer button */}
      <header className="relative z-10 w-full max-w-xl flex justify-between items-center mb-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#b5838d] tracking-wide uppercase">
          <Heart className="w-3.5 h-3.5 fill-[#f4a7b9] text-[#f4a7b9]" />
          <span>Say Yes or Else</span>
        </div>
        <button
          onClick={() => setShowCreatorModal(true)}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/70 hover:bg-white text-[#8c6b73] border border-[#f2e1e6] shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Edit3 className="w-3 h-3 text-[#f4a7b9]" />
          <span>Ask your own crush</span>
        </button>
      </header>

      {/* ── Main Dynamic Card Container ── */}
      <main className="relative z-10 w-full max-w-[500px] my-auto flex flex-col items-center">
        {/* Escape Notice Bubble */}
        {escapeNotice && (
          <div className="absolute -top-12 px-4 py-1.5 rounded-full bg-[#f4a7b9] text-white font-bold text-xs shadow-md animate-bounce">
            {escapeNotice}
          </div>
        )}

        {/* ── Screen 1: Landing ── */}
        {currentScreen === 'screen-1' && (
          <div className="w-full bg-white rounded-[28px] shadow-[0_12px_45px_rgba(0,0,0,0.08)] p-8 sm:p-10 text-center transition-all animate-in fade-in duration-300">
            <div className="relative mx-auto w-[120px] h-[120px] mb-6">
              <img
                src="/images/cat.jpeg"
                alt="Cute Cat"
                className="w-full h-full object-cover rounded-[22px] shadow-sm border border-pink-100"
              />
              <span className="absolute -bottom-2 -right-2 text-xl">🌸</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3d1a1a] leading-tight mb-2 font-serif">
              {crushName
                ? `🌸 ${crushName}, will you go on a date with ${senderName || 'me'}? 🌸`
                : '🌸 Will you go on a date with me? 🌸'}
            </h1>
            <p className="text-sm text-[#8c7474] mb-8 font-medium">
              Choose wisely... there is only one correct answer 😉
            </p>

            {/* YES button */}
            <div className="flex justify-center items-center my-2">
              <button
                ref={yesButtonRef}
                onClick={handleYes}
                style={{
                  transform: `scale(${Math.min(1.35, 1 + noCount * 0.04)})`,
                }}
                className="btn-yes-glow bg-[#f4a7b9] hover:bg-[#ef95a9] text-white font-extrabold text-xl sm:text-2xl px-12 py-4 rounded-full shadow-[0_6px_22px_rgba(244,167,185,0.55)] cursor-pointer transition-transform duration-200 active:scale-95 flex items-center gap-2"
              >
                <span>YES 💕</span>
              </button>
            </div>

            {noCount > 0 && (
              <p className="text-xs text-[#a68a8a] mt-6 italic">
                (You tried clicking 'No' {noCount} {noCount === 1 ? 'time' : 'times'}... the button simply disagrees)
              </p>
            )}
          </div>
        )}

        {/* ── Screen 2: Reaction (The exact screen from the YouTube Short!) ── */}
        {currentScreen === 'screen-2' && (
          <div className="w-full bg-white rounded-[28px] shadow-[0_12px_45px_rgba(0,0,0,0.08)] p-8 sm:p-10 text-center transition-all animate-in zoom-in-95 duration-300">
            <div className="relative mx-auto w-[150px] h-[120px] mb-6">
              <img
                src="/images/spongebob.png"
                alt="SpongeBob shocked"
                className="w-full h-full object-contain rounded-[22px]"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#3d1a1a] tracking-tight uppercase mb-3 font-serif">
              WAIT YOU ACTUALLY SAID YES?? 😭
            </h1>
            <p className="text-base text-[#7a6060] mb-8 font-medium">
              I was so ready for you to say no 😅
            </p>

            <button
              onClick={() => {
                playChime('pop');
                setCurrentScreen('screen-3');
              }}
              className="w-full bg-[#f4a7b9] hover:bg-[#ef95a9] text-white font-bold text-lg py-3.5 px-6 rounded-full shadow-[0_4px_16px_rgba(244,167,185,0.45)] cursor-pointer transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2 group"
            >
              <span>okay okay!</span>
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {/* ── Screen 3: Date & Time Picker ── */}
        {currentScreen === 'screen-3' && (
          <div className="w-full bg-white rounded-[28px] shadow-[0_12px_45px_rgba(0,0,0,0.08)] p-7 sm:p-9 text-center transition-all animate-in fade-in duration-300">
            <div className="text-4xl mb-3" aria-hidden="true">
              📅🐾
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3d1a1a] mb-2 font-serif">
              So... when are you free?
            </h1>
            <p className="text-sm text-[#8c7474] mb-6">Let's coordinate schedules before someone changes their mind.</p>

            {/* Quick date suggestion buttons */}
            <div className="text-left mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7a5555] mb-2">
                Quick Picks ✨
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {getQuickDates().map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedDate(item.iso);
                      setSelectedDateDisplay(item.display);
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                      selectedDate === item.iso
                        ? 'bg-[#f4a7b9] text-white border-[#f4a7b9] shadow-xs'
                        : 'bg-[#fbf7fa] hover:bg-[#f6ecf1] text-[#4d2626] border-[#ede5f5]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {selectedDate === item.iso && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>

              {/* Or manual date input */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-[1px] flex-1 bg-[#ede5f5]" />
                <span className="text-[11px] text-[#999] uppercase font-bold">Or pick any day</span>
                <div className="h-[1px] flex-1 bg-[#ede5f5]" />
              </div>

              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedDateDisplay(e.target.value);
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl border-2 border-[#ede5f5] focus:border-[#f4a7b9] outline-none text-sm font-semibold text-[#3d1a1a] bg-white cursor-pointer"
                />
              </div>
            </div>

            {/* Time select (revealed when date is chosen) */}
            {selectedDate && (
              <div className="text-left mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7a5555] mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#f4a7b9]" />
                  <span>What Time? 🕐</span>
                </label>

                <select
                  value={selectedTime?.value || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const found = [...MORNING_TIMES, ...EVENING_TIMES].find((t) => t.value === val);
                    setSelectedTime(found || null);
                  }}
                  className="w-full py-3 px-4 rounded-2xl border-2 border-[#ede5f5] focus:border-[#f4a7b9] outline-none text-sm font-bold text-[#3d1a1a] bg-white cursor-pointer"
                >
                  <option value="">Select a time...</option>
                  <optgroup label="☀️ Morning & Coffee Vibe">
                    {MORNING_TIMES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🌙 Evening & Dinner Vibe">
                    {EVENING_TIMES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </optgroup>
                </select>

                {selectedTime && (
                  <div className="mt-2.5 p-2.5 bg-[#fbf7fa] rounded-xl border border-pink-100 text-xs text-[#6e4d4d] font-medium flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#f4a7b9] shrink-0 mt-0.5" />
                    <span>{selectedTime.label}</span>
                  </div>
                )}
              </div>
            )}

            <button
              disabled={!selectedDate || !selectedTime}
              onClick={() => {
                if (!selectedDate || !selectedTime) return;
                playChime('pop');
                if (selectedTime.type === 'morning') {
                  setCurrentScreen('screen-4a');
                } else {
                  setCurrentScreen('screen-4b');
                }
              }}
              className="w-full bg-[#f4a7b9] hover:bg-[#ef95a9] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg py-3.5 px-6 rounded-full shadow-[0_4px_16px_rgba(244,167,185,0.45)] cursor-pointer transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2"
            >
              <span>set the date! 💕</span>
            </button>
          </div>
        )}

        {/* ── Screen 4A: Morning Activity ── */}
        {currentScreen === 'screen-4a' && (
          <div className="w-full bg-white rounded-[28px] shadow-[0_12px_45px_rgba(0,0,0,0.08)] p-6 sm:p-8 text-center transition-all animate-in fade-in duration-300">
            <div className="relative mx-auto w-[110px] h-[110px] mb-4">
              <img
                src="/images/shrek.jpeg"
                alt="Shrek grinning"
                className="w-full h-full object-cover rounded-[20px] border border-pink-100"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3d1a1a] mb-1 font-serif">
              What are we doing? ☀️✨
            </h1>
            <p className="text-xs text-[#8c7474] mb-4">Morning date locked in. Pick our activity:</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5 text-left">
              {MORNING_OPTIONS.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedChoice(opt.label)}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer min-h-[90px] ${
                    selectedChoice === opt.label
                      ? 'bg-[#f4a7b9]/15 border-[#f4a7b9] shadow-xs'
                      : 'bg-[#fbf7fa] hover:bg-[#f6ecf1] border-transparent'
                  }`}
                >
                  <span className="text-2xl mb-1">{opt.icon}</span>
                  <span className="text-[11px] font-bold leading-tight text-[#3d1a1a]">
                    {opt.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-left mb-5">
              <input
                type="text"
                placeholder="Or suggest something custom..."
                value={customChoice}
                onChange={(e) => {
                  setCustomChoice(e.target.value);
                  setSelectedChoice(e.target.value);
                }}
                className="w-full py-2 px-3.5 rounded-xl border border-[#ede5f5] text-xs font-semibold focus:border-[#f4a7b9] outline-none"
              />
            </div>

            <button
              disabled={!selectedChoice && !customChoice}
              onClick={() => {
                playChime('pop');
                setCurrentScreen('screen-5');
              }}
              className="w-full bg-[#f4a7b9] hover:bg-[#ef95a9] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg py-3.5 px-6 rounded-full shadow-[0_4px_16px_rgba(244,167,185,0.45)] cursor-pointer transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2"
            >
              <span>this one! →</span>
            </button>
          </div>
        )}

        {/* ── Screen 4B: Evening Food ── */}
        {currentScreen === 'screen-4b' && (
          <div className="w-full bg-white rounded-[28px] shadow-[0_12px_45px_rgba(0,0,0,0.08)] p-6 sm:p-8 text-center transition-all animate-in fade-in duration-300">
            <div className="relative mx-auto w-[110px] h-[110px] mb-4">
              <img
                src="/images/shrek.jpeg"
                alt="Shrek grinning"
                className="w-full h-full object-cover rounded-[20px] border border-pink-100"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3d1a1a] mb-1 font-serif">
              What are we feeling? 🍜✨
            </h1>
            <p className="text-xs text-[#8c7474] mb-4">Food is non-negotiable. What are we eating?</p>

            <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
              {EVENING_OPTIONS.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedChoice(opt.label)}
                  className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer min-h-[85px] ${
                    selectedChoice === opt.label
                      ? 'bg-[#f4a7b9]/15 border-[#f4a7b9] shadow-xs scale-105'
                      : 'bg-[#fbf7fa] hover:bg-[#f6ecf1] border-transparent'
                  }`}
                >
                  <span className="text-3xl mb-1">{opt.icon}</span>
                  <span className="text-xs font-bold text-[#3d1a1a]">{opt.label}</span>
                </div>
              ))}
            </div>

            <div className="text-left mb-5">
              <input
                type="text"
                placeholder="Craving something else? Type it here..."
                value={customChoice}
                onChange={(e) => {
                  setCustomChoice(e.target.value);
                  setSelectedChoice(e.target.value);
                }}
                className="w-full py-2 px-3.5 rounded-xl border border-[#ede5f5] text-xs font-semibold focus:border-[#f4a7b9] outline-none"
              />
            </div>

            <button
              disabled={!selectedChoice && !customChoice}
              onClick={() => {
                playChime('pop');
                setCurrentScreen('screen-5');
              }}
              className="w-full bg-[#f4a7b9] hover:bg-[#ef95a9] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg py-3.5 px-6 rounded-full shadow-[0_4px_16px_rgba(244,167,185,0.45)] cursor-pointer transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2"
            >
              <span>this one! →</span>
            </button>
          </div>
        )}

        {/* ── Screen 5: Phone Number ── */}
        {currentScreen === 'screen-5' && (
          <div className="w-full bg-white rounded-[28px] shadow-[0_12px_45px_rgba(0,0,0,0.08)] p-7 sm:p-9 text-center transition-all animate-in fade-in duration-300">
            <div className="text-4xl mb-3">📱💕</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3d1a1a] mb-2 font-serif">
              Last thing — what's your number? 📱
            </h1>
            <p className="text-sm text-[#7a6060] mb-6 leading-relaxed">
              So I can send you the details.
              <br />
              Promise I won't spam you (much).
            </p>

            <form onSubmit={handleLockIn} className="text-left">
              <div className="mb-4">
                <label className="block text-xs font-bold text-[#3d1a1a] mb-1.5 uppercase tracking-wider">
                  Your number or Instagram handle
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-3.5 w-4 h-4 text-[#b5838d]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. +1 555-0199 or @username"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full py-3 pl-10 pr-4 rounded-2xl border-2 border-[#ede5f5] focus:border-[#f4a7b9] outline-none text-sm font-semibold text-[#3d1a1a]"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-[#7a6060] mb-1.5">
                  Anything else I should know? (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Dietary preferences, coffee order, or song request..."
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#ede5f5] focus:border-[#f4a7b9] outline-none text-xs font-medium text-[#3d1a1a]"
                />
              </div>

              <button
                type="submit"
                disabled={!phoneNumber.trim()}
                className="w-full bg-[#f4a7b9] hover:bg-[#ef95a9] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg py-3.5 px-6 rounded-full shadow-[0_4px_16px_rgba(244,167,185,0.45)] cursor-pointer transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2"
              >
                <span>lock it in! 💕</span>
              </button>
            </form>
          </div>
        )}

        {/* ── Screen 6: Final Confirmation ── */}
        {currentScreen === 'screen-6' && (
          <div className="w-full bg-white rounded-[28px] shadow-[0_12px_45px_rgba(0,0,0,0.08)] p-7 sm:p-9 text-center transition-all animate-in zoom-in-95 duration-400">
            <div className="relative mx-auto w-[120px] h-[120px] mb-4">
              <img
                src="/images/dog.png"
                alt="Dog meme"
                className="w-full h-full object-contain rounded-[22px]"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#3d1a1a] mb-2 font-serif">
              Glad you didn't say 'No'.
            </h1>

            <p className="text-sm text-[#5a3a3a] mb-3 leading-relaxed font-medium">
              Instructions will follow via mobile.
              <br />
              Be there on <span className="font-extrabold text-[#b83b5e]">{selectedDateDisplay || selectedDate}</span> at{' '}
              <span className="font-extrabold text-[#b83b5e]">{selectedTime?.display}</span> sharp.
              <br />
              I'll see you there! {selectedTime?.type === 'morning' ? '🐾' : '🍽️'}
            </p>

            {/* Selected choice pill */}
            <div className="inline-block bg-[#f3eeff] border border-purple-100 rounded-full px-4 py-1.5 text-xs font-bold text-[#442255] mb-4">
              ✨ {selectedChoice || customChoice || 'Special Surprise'}
            </div>

            {/* ── Weather Forecast & Umbrella / Sunglasses Advice Card ── */}
            <div className="w-full bg-[#fdfafb] border border-[#f5e6ec] rounded-2xl p-4 mb-5 text-left transition-all shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#6d3d4b]">
                  <CloudSun className="w-4 h-4 text-[#f4a7b9]" />
                  <span>Date Weather Forecast</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Detect your current location via GPS / IP"
                    onClick={() => detectCurrentLocation()}
                    disabled={detectingLocation}
                    className="text-[11px] font-bold text-[#b5838d] hover:text-[#3d1a1a] flex items-center gap-1 px-2 py-0.5 rounded-md bg-white hover:bg-pink-50 border border-pink-100 shadow-2xs transition-all cursor-pointer"
                  >
                    <LocateFixed className={`w-3 h-3 text-[#f4a7b9] ${detectingLocation ? 'animate-spin' : ''}`} />
                    <span>{detectingLocation ? 'Locating...' : 'Detect Location'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingCity(!editingCity);
                      setCityInput(weatherCity);
                    }}
                    className="text-[11px] font-bold text-[#b5838d] hover:text-[#3d1a1a] flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-pink-50 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3 h-3 text-[#f4a7b9]" />
                    <span>{weatherData?.cityName || weatherCity}</span>
                    <span className="text-[10px] text-[#999]">({editingCity ? 'close' : 'change'})</span>
                  </button>

                  <button
                    type="button"
                    title="Refresh forecast"
                    onClick={() => fetchWeatherForDate(selectedDate, weatherCity)}
                    className="p-1 rounded-md text-[#b5838d] hover:text-[#3d1a1a] hover:bg-pink-50 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${weatherLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Location detection status banner */}
              {locationStatus && (
                <div className="mb-2.5 px-2.5 py-1.5 rounded-lg bg-[#eaf7ee] border border-[#c3e8cb] text-[10.5px] font-semibold text-[#276738] flex items-center justify-between animate-location-pulse shadow-xs">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-[#2e7d32]" />
                    <span>{locationStatus}</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#1b5e20] bg-white/70 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] animate-ping" />
                    <span>GPS Accurate</span>
                  </span>
                </div>
              )}

              {/* City edit input */}
              {editingCity && (
                <div className="mb-3 p-2 bg-white rounded-xl border border-pink-100 animate-in fade-in duration-200">
                  <div className="flex gap-1.5 mb-2">
                    <input
                      type="text"
                      placeholder="Type city (e.g. London, Chicago, Paris)..."
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (cityInput.trim()) {
                            setWeatherCity(cityInput.trim());
                            setLocationStatus(null);
                            setEditingCity(false);
                          }
                        }
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg border border-[#ede5f5] text-xs font-semibold focus:border-[#f4a7b9] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (cityInput.trim()) {
                          setWeatherCity(cityInput.trim());
                          setLocationStatus(null);
                          setEditingCity(false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#f4a7b9] text-white text-xs font-bold hover:bg-[#ef95a9] cursor-pointer"
                    >
                      Update
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-pink-50">
                    <button
                      type="button"
                      onClick={() => {
                        detectCurrentLocation();
                        setEditingCity(false);
                      }}
                      className="text-[11px] font-bold text-[#b5838d] hover:text-[#d81b60] flex items-center gap-1 cursor-pointer"
                    >
                      <LocateFixed className="w-3 h-3" />
                      <span>Use My Exact GPS Location</span>
                    </button>

                    <div className="flex flex-wrap gap-1 text-[10px] text-[#8c7474]">
                      <span>Quick:</span>
                      {['New York', 'London', 'Paris', 'Tokyo'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setWeatherCity(c);
                            setLocationStatus(null);
                            setEditingCity(false);
                          }}
                          className="underline hover:text-[#3d1a1a] cursor-pointer"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading state */}
              {weatherLoading && !weatherData && (
                <div className="py-4 text-center text-xs text-[#8c7474] flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#f4a7b9]" />
                  <span>Checking skies and forecast for your date...</span>
                </div>
              )}

              {/* Error state */}
              {weatherError && !weatherLoading && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                  <span>{weatherError}</span>
                  <button
                    type="button"
                    onClick={() => fetchWeatherForDate(selectedDate, weatherCity)}
                    className="underline font-bold text-amber-900 cursor-pointer ml-2"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Weather Content with Umbrella / Sunglasses Advice */}
              {weatherData && (
                <div>
                  {/* Highlight Advice Box */}
                  <div
                    className={`p-3 rounded-xl border flex items-start gap-3 mb-2.5 ${
                      weatherData.advice === 'umbrella'
                        ? 'bg-[#edf6ff] border-[#bde0fe] text-[#003049]'
                        : weatherData.advice === 'sunglasses'
                        ? 'bg-[#fff9e6] border-[#ffe066] text-[#7f4f00]'
                        : weatherData.advice === 'both'
                        ? 'bg-[#f8f0fc] border-[#e5bbf2] text-[#4a154b]'
                        : 'bg-[#f4f7f6] border-[#d8e2dc] text-[#2b2d42]'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white/80 shrink-0 shadow-xs">
                      {weatherData.advice === 'umbrella' ? (
                        <Umbrella className="w-5 h-5 text-[#023e8a] animate-weather-umbrella" />
                      ) : weatherData.advice === 'sunglasses' ? (
                        <Glasses className="w-5 h-5 text-[#d48b00] animate-weather-shades" />
                      ) : weatherData.advice === 'both' ? (
                        <CloudSun className="w-5 h-5 text-[#9b5de5] animate-weather-cloud" />
                      ) : (
                        <Sun className="w-5 h-5 text-[#f77f00] animate-weather-sun" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-extrabold text-xs mb-0.5 flex items-center gap-1.5">
                        <span>{weatherData.adviceTitle}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                        {weatherData.adviceMessage}
                      </p>
                    </div>
                  </div>

                  {/* Weather Stats Bar */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] bg-white rounded-xl p-2 border border-[#f2e6eb]">
                    <div>
                      <span className="block text-[10px] text-[#999] uppercase font-bold">Conditions</span>
                      <span className="font-bold text-[#3d1a1a] truncate flex items-center justify-center gap-1">
                        <span className="animate-weather-bob inline-block">{weatherData.icon}</span>
                        <span className="truncate">{weatherData.condition}</span>
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#999] uppercase font-bold">Temperature</span>
                      <span className="font-bold text-[#3d1a1a]">
                        {weatherData.tempMaxC}°C ({weatherData.tempMaxF}°F)
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#999] uppercase font-bold">Rain Chance</span>
                      <span className={`font-bold flex items-center justify-center gap-0.5 ${weatherData.precipProb >= 35 ? 'text-blue-600' : 'text-[#3d1a1a]'}`}>
                        {weatherData.precipProb >= 35 && (
                          <CloudRain className="w-3 h-3 text-blue-500 animate-weather-bob inline-block shrink-0" />
                        )}
                        <span>{weatherData.precipProb}%</span>
                      </span>
                    </div>
                  </div>

                  {weatherData.isApproximate && (
                    <p className="text-[10px] text-[#9c8585] mt-1.5 italic text-center">
                      📅 Date is beyond 16-day window: showing typical seasonal outlook.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Interactive Actions: Google Calendar, .ics file, WhatsApp */}
            <div className="flex flex-col gap-2.5 mb-6 text-xs font-bold">
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#e8f0fe] hover:bg-[#d8e5fd] text-[#1967d2] flex items-center justify-center gap-2 transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Add to Google Calendar</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={downloadIcsFile}
                  className="py-2.5 px-3 rounded-xl bg-[#f5f5f5] hover:bg-[#ebebeb] text-[#444] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Download .ics file</span>
                </button>

                <a
                  href={getWhatsAppShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#e6f7ec] hover:bg-[#d4f2de] text-[#128c7e] flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Send to WhatsApp</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => {
                  playChime('pop');
                  triggerMegaCelebrationConfetti();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#fff0f3] hover:bg-[#ffe3e8] text-[#d90429] flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#ffccd5]"
              >
                <Sparkles className="w-4 h-4 text-[#ff4d6d]" />
                <span>Replay Celebration Confetti 🎉</span>
              </button>
            </div>

            {/* The Viral PS Note */}
            <p className="text-[11px] text-[#9c8585] italic leading-relaxed border-t border-[#f5ecf0] pt-4 mb-4">
              PS: Normal people text. I made a website in Cursor using Claude Code. During lunch. For you. No big deal. 😎
            </p>

            {/* Reset button */}
            <button
              onClick={() => {
                setCurrentScreen('screen-1');
                setNoCount(0);
                setSelectedDate('');
                setSelectedTime(null);
                setSelectedChoice('');
                setCustomChoice('');
                setPhoneNumber('');
              }}
              className="inline-flex items-center gap-1 text-[11px] text-[#b5838d] hover:text-[#3d1a1a] font-bold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Start over from beginning</span>
            </button>
          </div>
        )}
      </main>

      {/* ── Fixed Evasive "no... 🙈" button (Only on Screen 1) ── */}
      {currentScreen === 'screen-1' && noButtonPos && (
        <button
          ref={noButtonRef}
          type="button"
          onMouseEnter={moveNoButton}
          onTouchStart={(e) => {
            e.preventDefault();
            moveNoButton();
          }}
          onClick={(e) => {
            e.preventDefault();
            moveNoButton();
          }}
          style={{
            position: 'fixed',
            left: `${noButtonPos.x}px`,
            top: `${noButtonPos.y}px`,
            zIndex: 999,
          }}
          className="bg-[#c9b8e8] hover:bg-[#bba7dd] text-white text-sm font-extrabold px-5 py-2 rounded-full shadow-[0_4px_14px_rgba(201,184,232,0.5)] cursor-pointer select-none transition-all duration-200 ease-out active:scale-95"
        >
          {NO_BUTTON_TEXTS[Math.min(noCount, NO_BUTTON_TEXTS.length - 1)]}
        </button>
      )}

      {/* Footer Branding like in the video */}
      <footer className="relative z-10 text-[11px] text-[#b5838d] font-semibold mt-4 text-center">
        <span>built with love for you 🌸</span>
      </footer>

      {/* ── Modal: Custom Date Proposal Generator (Viral share feature) ── */}
      {showCreatorModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[26px] p-6 sm:p-7 max-w-md w-full shadow-2xl text-left">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-[#3d1a1a] font-serif flex items-center gap-2">
                <span>Ask Out Your Crush</span>
                <Heart className="w-5 h-5 fill-[#f4a7b9] text-[#f4a7b9]" />
              </h2>
              <button
                onClick={() => setShowCreatorModal(false)}
                className="text-[#999] hover:text-[#333] text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#7a6060] mb-5">
              Customize this exact viral interactive proposal with your crush's name and send them your private link!
            </p>

            <div className="space-y-3.5 mb-6">
              <div>
                <label className="block text-xs font-bold text-[#3d1a1a] mb-1">
                  Crush's Name / Nickname
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jessica, Sarah, Alex..."
                  value={crushName}
                  onChange={(e) => setCrushName(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-[#ede5f5] focus:border-[#f4a7b9] outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3d1a1a] mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Michael, Ryan..."
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-[#ede5f5] focus:border-[#f4a7b9] outline-none text-sm font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyCustomLink}
                className="flex-1 bg-[#f4a7b9] hover:bg-[#ef95a9] text-white font-bold py-3 rounded-full text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Shareable Link</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreatorModal(false);
                  setCurrentScreen('screen-1');
                  setNoCount(0);
                }}
                className="px-5 py-3 rounded-full bg-[#fbf7fa] hover:bg-[#f2e5ea] text-[#3d1a1a] text-xs font-bold transition-all cursor-pointer"
              >
                Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
