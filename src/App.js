import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom'; // NEW: Import Routes and Route
import './App.css';
import MovieCard from './components/MovieCard';
import SearchBar from './components/SearchBar';
// import PaginationControls from './components/PaginationControls'; // Will add dedicated component later
import MovieDetailPage from './pages/MovieDetailPage'; // NEW: Import the actual MovieDetailPage

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMovies = useCallback(async (term = '', page = 1) => {
    setLoading(true);
    setError(null);
    let url = '';

    if (!TMDB_API_KEY) {
      setError("TMDb API Key not found. Please check your .env.local file.");
      setLoading(false);
      return;
    }

    if (term) {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(term)}&page=${page}&include_adult=false`;
    } else {
      url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
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
        imageUrl: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image',
        releaseDate: movie.release_date
      })));
      setTotalPages(data.total_pages);
      setCurrentPage(data.page);

    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Failed to fetch movies. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies('', 1);
  }, [fetchMovies]);

 const handleSearch = (term) => {
  setCurrentSearchTerm(term); // Keep track of the current search term

  // Reset page to 1 for any search or clear action
  setCurrentPage(1);

  if (term.trim() === '') { // Check if the term is empty or just whitespace
    fetchMovies('', 1); // Fetch popular movies (empty term means popular)
  } else {
    fetchMovies(term, 1); // Fetch movies for the given search term
  }

  window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
};
  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchMovies(currentSearchTerm, nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
    fetchMovies(currentSearchTerm, prevPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="App">
      <h1>My Movie Database</h1>
      <SearchBar onSearch={handleSearch} />

      {/* NEW: Routes will manage what is rendered based on the URL */}
      <Routes>
        <Route path="/" element={ // The main route for home/search page
          <> {/* React Fragment to return multiple elements */}
            {movies.length === 0 && !loading && !error && currentSearchTerm && (
              <p>No results found for "{currentSearchTerm}".</p>
            )}
            <div className="movie-list">
              {movies.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie} // <<< Pass the entire movie object as a prop
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
              </div>
            )}
          </>
        } />
        {/* NEW: Route for individual movie details. :id is a URL parameter */}
        <Route path="/movie/:id" element={<MovieDetailPage />} />
      </Routes>
    </div>
  );
}

export default App;