const OMDB_URL = 'https://www.omdbapi.com/';
const API_KEY = process.env.REACT_APP_OMDB_KEY || '4d2dd959';

// Extract genres, actors, directors from user's media
const analyzeUserPreferences = (userMedia) => {
  const preferences = {
    genres: {},
    actors: {},
    directors: {},
    years: {},
    types: {}
  };

  userMedia.forEach(item => {
    // Count genres
    if (item.Genre) {
      item.Genre.split(',').forEach(genre => {
        const cleanGenre = genre.trim();
        preferences.genres[cleanGenre] = (preferences.genres[cleanGenre] || 0) + 1;
      });
    }

    // Count actors
    if (item.Actors) {
      item.Actors.split(',').slice(0, 2).forEach(actor => {
        const cleanActor = actor.trim();
        preferences.actors[cleanActor] = (preferences.actors[cleanActor] || 0) + 1;
      });
    }

    // Count directors
    if (item.Director) {
      item.Director.split(',').forEach(director => {
        const cleanDirector = director.trim();
        preferences.directors[cleanDirector] = (preferences.directors[cleanDirector] || 0) + 1;
      });
    }

    // Count years (decade preference)
    if (item.Year) {
      const decade = Math.floor(parseInt(item.Year) / 10) * 10;
      preferences.years[decade] = (preferences.years[decade] || 0) + 1;
    }

    // Count types
    if (item.Type) {
      preferences.types[item.Type] = (preferences.types[item.Type] || 0) + 1;
    }
  });

  return preferences;
};

// Get top preferences
const getTopPreferences = (preferences, limit = 3) => {
  const sorted = Object.entries(preferences)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit);
  return sorted.map(([key]) => key);
};

// Generate search queries based on user preferences
const generateRecommendationQueries = (userMedia) => {
  if (!userMedia || userMedia.length === 0) {
    // Default popular searches for new users
    return [
      'marvel',
      'christopher nolan',
      'thriller 2023',
      'comedy',
      'action adventure'
    ];
  }

  const preferences = analyzeUserPreferences(userMedia);
  const queries = [];

  // Add genre-based queries
  const topGenres = getTopPreferences(preferences.genres, 2);
  topGenres.forEach(genre => {
    queries.push(genre.toLowerCase());
  });

  // Add director-based queries
  const topDirectors = getTopPreferences(preferences.directors, 2);
  topDirectors.forEach(director => {
    if (director !== 'N/A') {
      queries.push(director);
    }
  });

  // Add actor-based queries
  const topActors = getTopPreferences(preferences.actors, 1);
  topActors.forEach(actor => {
    if (actor !== 'N/A') {
      queries.push(actor);
    }
  });

  // Add similar titles based on existing ones
  const recentMovies = userMedia.slice(0, 2);
  recentMovies.forEach(movie => {
    if (movie.Genre) {
      const firstGenre = movie.Genre.split(',')[0].trim().toLowerCase();
      queries.push(`${firstGenre} ${movie.Year || '2023'}`);
    }
  });

  return queries.slice(0, 6); // Limit to 6 queries
};

// Fetch recommendations from OMDB
export const getPersonalizedRecommendations = async (userMedia, limit = 12) => {
  try {
    const queries = generateRecommendationQueries(userMedia);
    const recommendations = [];
    const seenIds = new Set();

    // Add existing user media IDs to avoid duplicates
    userMedia.forEach(item => {
      if (item.imdbID) seenIds.add(item.imdbID);
    });

    for (const query of queries) {
      try {
        // Search for movies
        const movieResponse = await fetch(
          `${OMDB_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie`
        );
        const movieData = await movieResponse.json();

        if (movieData.Response === 'True' && movieData.Search) {
          movieData.Search.slice(0, 3).forEach(item => {
            if (!seenIds.has(item.imdbID)) {
              recommendations.push({
                id: item.imdbID,
                imdbID: item.imdbID,
                title: item.Title,
                subtitle: `${item.Type?.toUpperCase()} • ${item.Year}`,
                poster: item.Poster !== 'N/A' ? item.Poster : null,
                type: item.Type,
                year: item.Year,
                source: 'recommendation'
              });
              seenIds.add(item.imdbID);
            }
          });
        }

        // Search for series if user has series in their list
        const userHasSeries = userMedia.some(item => item.Type === 'series');
        if (userHasSeries) {
          const seriesResponse = await fetch(
            `${OMDB_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=series`
          );
          const seriesData = await seriesResponse.json();

          if (seriesData.Response === 'True' && seriesData.Search) {
            seriesData.Search.slice(0, 2).forEach(item => {
              if (!seenIds.has(item.imdbID)) {
                recommendations.push({
                  id: item.imdbID,
                  imdbID: item.imdbID,
                  title: item.Title,
                  subtitle: `${item.Type?.toUpperCase()} • ${item.Year}`,
                  poster: item.Poster !== 'N/A' ? item.Poster : null,
                  type: item.Type,
                  year: item.Year,
                  source: 'recommendation'
                });
                seenIds.add(item.imdbID);
              }
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch recommendations for query: ${query}`, error);
      }
    }

    // Shuffle and limit results
    const shuffled = recommendations.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);

  } catch (error) {
    console.error('Failed to generate recommendations:', error);
    return [];
  }
};

// Get recommendations for similar items (for detail page)
export const getSimilarRecommendations = async (currentItem, userMedia, limit = 8) => {
  try {
    const queries = [];
    
    // Based on current item's genre
    if (currentItem.Genre) {
      const genres = currentItem.Genre.split(',').slice(0, 2);
      genres.forEach(genre => {
        queries.push(genre.trim().toLowerCase());
      });
    }

    // Based on current item's director
    if (currentItem.Director && currentItem.Director !== 'N/A') {
      queries.push(currentItem.Director);
    }

    // Based on current item's main actor
    if (currentItem.Actors && currentItem.Actors !== 'N/A') {
      const firstActor = currentItem.Actors.split(',')[0].trim();
      queries.push(firstActor);
    }

    const recommendations = [];
    const seenIds = new Set([currentItem.imdbID]);

    // Add existing user media IDs to avoid duplicates
    userMedia.forEach(item => {
      if (item.imdbID) seenIds.add(item.imdbID);
    });

    for (const query of queries.slice(0, 4)) {
      try {
        const response = await fetch(
          `${OMDB_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=${currentItem.Type || 'movie'}`
        );
        const data = await response.json();

        if (data.Response === 'True' && data.Search) {
          data.Search.slice(0, 3).forEach(item => {
            if (!seenIds.has(item.imdbID)) {
              recommendations.push({
                id: item.imdbID,
                imdbID: item.imdbID,
                title: item.Title,
                subtitle: `${item.Type?.toUpperCase()} • ${item.Year}`,
                poster: item.Poster !== 'N/A' ? item.Poster : null,
                type: item.Type,
                year: item.Year,
                source: 'similar'
              });
              seenIds.add(item.imdbID);
            }
          });
        }
      } catch (error) {
        console.warn(`Failed to fetch similar recommendations for: ${query}`, error);
      }
    }

    return recommendations.slice(0, limit);
  } catch (error) {
    console.error('Failed to get similar recommendations:', error);
    return [];
  }
};

const recommendationUtils = {
  getPersonalizedRecommendations,
  getSimilarRecommendations
};

export default recommendationUtils;
