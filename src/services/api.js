// API service layer: all network calls stay in one file so React components stay clean.
export async function fetchPosts() {
  const res = await fetch("/data/posts.json");
  if (!res.ok) throw new Error(`Couldn’t load posts (error ${res.status}).`);
  return res.json();
}

export async function fetchGithub(username) {
  const name = encodeURIComponent(username.trim());
  const res = await fetch(`https://api.github.com/users/${name}`);
  if (res.status === 404) throw new Error(`No GitHub user named “${username.trim()}”.`);
  if (!res.ok) throw new Error(`GitHub didn’t respond (error ${res.status}). You may be rate-limited — try again later.`);
  const user = await res.json();
  const reposRes = await fetch(`https://api.github.com/users/${name}/repos?sort=updated&per_page=6`);
  const repos = reposRes.ok ? await reposRes.json() : [];
  return { user, repos };
}

// ---------------------------------------------------------------------------
// Public, key-less APIs used by the new features. Every call goes through
// getJson() so loading / error / timeout behaviour is identical everywhere.
// ---------------------------------------------------------------------------
async function getJson(url, label, timeoutMs = 9000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`${label} didn’t respond (error ${res.status}).`);
    return await res.json();
  } catch (e) {
    if (e.name === "AbortError") throw new Error(`${label} took too long to respond. Check your connection and try again.`);
    if (e instanceof TypeError) throw new Error(`Couldn’t reach ${label}. Check your internet connection.`);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// meme-api.com wraps Reddit; we drop NSFW / spoiler posts and non-image links.
export async function fetchLiveMemes(subreddit = "memes", count = 6) {
  const data = await getJson(`https://meme-api.com/gimme/${encodeURIComponent(subreddit)}/${count}`, "The meme service");
  const list = (data.memes || []).filter((m) => !m.nsfw && !m.spoiler && /\.(jpe?g|png|gif|webp)$/i.test(m.url || ""));
  return list.map((m) => ({
    id: `live-${m.postLink}`,
    author: `u/${m.author}`,
    topic: "Campus Life",
    caption: m.title,
    image: m.url,
    upvotes: Math.min(m.ups || 0, 9999),
    saved: false,
    live: true,
    source: m.subreddit,
  }));
}

// Open-Meteo: free, no key. Coordinates are Chitkara University, Rajpura.
export async function fetchWeather() {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=30.5167&longitude=76.66" +
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
    "&timezone=auto&forecast_days=3";
  const data = await getJson(url, "The weather service");
  if (!data.current || !data.daily) throw new Error("The weather service sent an unexpected response. Try again.");
  return data;
}

export async function fetchQuote() {
  const q = await getJson("https://dummyjson.com/quotes/random", "The quote service");
  if (!q.quote) throw new Error("The quote service sent an unexpected response. Try again.");
  return { text: q.quote, author: q.author };
}

export async function fetchJoke() {
  const j = await getJson("https://official-joke-api.appspot.com/jokes/programming/random", "The joke service");
  const item = Array.isArray(j) ? j[0] : j;
  if (!item || !item.setup) throw new Error("The joke service sent an unexpected response. Try again.");
  return { setup: item.setup, punchline: item.punchline };
}

export async function fetchJobs() {
  const base = "https://remotive.com/api/remote-jobs?category=software-dev&limit=8";
  let data = await getJson(base + "&search=intern", "The jobs board");
  // Few results for "intern"? Fall back to general software openings.
  if (!(data.jobs || []).length) data = await getJson(base, "The jobs board");
  return (data.jobs || []).slice(0, 8).map((j) => ({
    id: j.id,
    title: j.title,
    company: j.company_name,
    type: (j.job_type || "").replace(/_/g, " "),
    location: j.candidate_required_location || "Anywhere",
    tags: (j.tags || []).slice(0, 4),
    url: j.url,
    posted: j.publication_date,
  }));
}

export async function searchBooks(query) {
  const data = await getJson(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8&fields=key,title,author_name,first_publish_year,cover_i,edition_count`, "Open Library");
  return (data.docs || []).map((d) => ({
    id: d.key,
    title: d.title,
    authors: (d.author_name || []).slice(0, 2).join(", ") || "Unknown author",
    year: d.first_publish_year,
    editions: d.edition_count,
    cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
    url: `https://openlibrary.org${d.key}`,
  }));
}
