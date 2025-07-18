import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import './App.css';
import MovieCard from './components/MovieCard';
import SearchBar from './components/SearchBar'; // Import SearchBar

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false); // Start as false initially, only load on search or first popular fetch
  const [error, setError] = useState(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState(''); // New state for search term

  // Memoize the fetch function using useCallback to prevent unnecessary re-creations
  // and ensure it doesn't cause issues with useEffect dependencies
  const fetchMovies = useCallback(async (term = '') => {
    setLoading(true);
    setError(null);
    let url = '';

    if (!TMDB_API_KEY) {
      setError("TMDb API Key not found. Please check your .env.local file.");
      setLoading(false);
      return;
    }

    if (term) {
      // Search endpoint
      url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(term)}&page=1&include_adult=false`;
    } else {
      // Popular movies endpoint if no search term
      url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMovies(data.results.map(movie => ({
        id: movie.id,
        title: movie.title,
        imageUrl: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image', // Placeholder for missing images
        releaseDate: movie.release_date
      })));
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Failed to fetch movies. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []); // Only recreate fetchMovies if API key changes

  // Initial load of popular movies
  useEffect(() => {
    fetchMovies(); // Call without a term to get popular movies
  }, [fetchMovies]); // Dependency: fetchMovies itself (due to useCallback)

  const handleSearch = (term) => {
    setCurrentSearchTerm(term);
    fetchMovies(term); // Call fetchMovies with the new search term
  };

  if (loading) {
    return <div className="App">Loading movies...</div>;
  }

  if (error) {
    return <div className="App" style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div className="App">
      <h1>My Movie Database</h1>
      <SearchBar onSearch={handleSearch} /> {/* Pass the handleSearch function as a prop */}
      {movies.length === 0 && !loading && !error && currentSearchTerm && (
        <p>No results found for "{currentSearchTerm}".</p>
      )}
      <div className="movie-list">
        {movies.map(movie => (
          <MovieCard
            key={movie.id}
            title={movie.title}
            imageUrl={movie.imageUrl}
            releaseDate={movie.releaseDate}
          />
        ))}
      </div>
    </div>
  );
}

export default App;