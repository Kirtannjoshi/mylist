const TMDB_API = 'https://api.themoviedb.org/3';

export async function tmdbFetch(path, params = {}) {
  const apiKey = process.env.REACT_APP_TMDB_KEY;
  const qs = new URLSearchParams({ api_key: apiKey, ...params }).toString();
  const res = await fetch(`${TMDB_API}${path}?${qs}`);
  if (!res.ok) throw new Error('TMDB request failed');
  return res.json();
}

export async function findByImdb(imdbID) {
  // Find TMDB id using IMDB id
  return tmdbFetch('/find/' + imdbID, { external_source: 'imdb_id' });
}

export async function getWatchProviders(type, tmdbId) {
  // type: 'movie' | 'tv'
  return tmdbFetch(`/${type}/${tmdbId}/watch/providers`);
}
