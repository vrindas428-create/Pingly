import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Droplets, Wind, Thermometer, Quote, Laugh } from "lucide-react";
import { loadWeather, loadQuote, loadJoke } from "../../store/pulseSlice.js";

// WMO weather codes -> emoji + short text
function describe(code) {
  if (code === 0) return ["☀️", "Clear sky"];
  if (code <= 2) return ["⛅", "Partly cloudy"];
  if (code === 3) return ["☁️", "Overcast"];
  if (code === 45 || code === 48) return ["🌫️", "Foggy"];
  if (code >= 51 && code <= 57) return ["🌦️", "Drizzle"];
  if (code >= 61 && code <= 67) return ["🌧️", "Rain"];
  if (code >= 71 && code <= 77) return ["❄️", "Snow"];
  if (code >= 80 && code <= 82) return ["🌧️", "Showers"];
  if (code >= 95) return ["⛈️", "Thunderstorm"];
  return ["🌡️", "Mixed"];
}
function advice(temp, rainChance) {
  if (rainChance >= 60) return "☔ Rain likely — carry an umbrella and give yourself extra time to reach class.";
  if (temp >= 36) return "🥵 It's scorching — carry water and skip the noon walk to the canteen.";
  if (temp >= 30) return "😎 Warm day — a bottle of water and sunglasses are a good call.";
  if (temp <= 10) return "🧥 Cold out there — layer up before the 8 AM lecture.";
  return "🌿 Pleasant weather — a great day to study outside or walk to the library.";
}
const dayName = (iso, i) => (i === 0 ? "Today" : new Date(iso).toLocaleDateString("en-IN", { weekday: "short" }));

function Status({ slice, retry, children }) {
  if (slice.status === "loading" || slice.status === "idle") return <p className="muted tl-loading"><RefreshCw size={14} className="spin" /> Loading…</p>;
  if (slice.status === "error") return <div><p className="form-error" role="alert">{slice.error}</p><button className="btn btn--outline" onClick={retry}>Try again</button></div>;
  return children;
}

export function CampusPulse() {
  const dispatch = useDispatch();
  const { weather, quote, joke } = useSelector((st) => st.pulse);
  const [showPunch, setShowPunch] = useState(false);

  useEffect(() => {
    if (weather.status === "idle") dispatch(loadWeather());
    if (quote.status === "idle") dispatch(loadQuote());
    if (joke.status === "idle") dispatch(loadJoke());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const w = weather.data;
  const [icon, text] = w ? describe(w.current.weather_code) : ["", ""];

  return (
    <div className="tl-pulse">
      <section className="card tl-weather">
        <div className="tl-card-head"><p className="eyebrow">CAMPUS WEATHER //</p><button className="icon-btn" onClick={() => dispatch(loadWeather())} aria-label="Refresh weather" title="Refresh"><RefreshCw size={15} className={weather.status === "loading" ? "spin" : ""} /></button></div>
        <Status slice={weather} retry={() => dispatch(loadWeather())}>
          {w && <>
            <div className="tl-weather__now">
              <span className="tl-weather__icon" aria-hidden="true">{icon}</span>
              <div><strong>{Math.round(w.current.temperature_2m)}°C</strong><small className="muted">{text} · Rajpura, Punjab</small></div>
            </div>
            <div className="tl-weather__stats">
              <span><Thermometer size={14} /> Feels {Math.round(w.current.apparent_temperature)}°</span>
              <span><Droplets size={14} /> {w.current.relative_humidity_2m}%</span>
              <span><Wind size={14} /> {Math.round(w.current.wind_speed_10m)} km/h</span>
            </div>
            <p className="tl-advice">{advice(w.current.temperature_2m, w.daily.precipitation_probability_max[0])}</p>
            <div className="tl-forecast">
              {w.daily.time.map((d, i) => (
                <div key={d}><small>{dayName(d, i)}</small><span>{describe(w.daily.weather_code[i])[0]}</span><b>{Math.round(w.daily.temperature_2m_max[i])}° / {Math.round(w.daily.temperature_2m_min[i])}°</b><small>💧 {w.daily.precipitation_probability_max[i]}%</small></div>
              ))}
            </div>
          </>}
        </Status>
      </section>

      <section className="card tl-quote">
        <div className="tl-card-head"><p className="eyebrow"><Quote size={13} /> MOTIVATION //</p><button className="icon-btn" onClick={() => dispatch(loadQuote())} aria-label="New quote" title="New quote"><RefreshCw size={15} className={quote.status === "loading" ? "spin" : ""} /></button></div>
        <Status slice={quote} retry={() => dispatch(loadQuote())}>
          {quote.data && <blockquote><p>“{quote.data.text}”</p><footer>— {quote.data.author}</footer></blockquote>}
        </Status>
      </section>

      <section className="card tl-joke">
        <div className="tl-card-head"><p className="eyebrow"><Laugh size={13} /> DEBUGGING YOUR MOOD //</p><button className="icon-btn" onClick={() => { setShowPunch(false); dispatch(loadJoke()); }} aria-label="New joke" title="New joke"><RefreshCw size={15} className={joke.status === "loading" ? "spin" : ""} /></button></div>
        <Status slice={joke} retry={() => dispatch(loadJoke())}>
          {joke.data && <>
            <p className="tl-joke__setup">{joke.data.setup}</p>
            {showPunch ? <p className="tl-joke__punch">{joke.data.punchline} 😄</p> : <button className="btn btn--outline" onClick={() => setShowPunch(true)}>Reveal punchline</button>}
          </>}
        </Status>
      </section>
      <p className="muted">Live data from Open-Meteo, DummyJSON and the Official Joke API — fetched with Redux Toolkit async thunks.</p>
    </div>
  );
}
