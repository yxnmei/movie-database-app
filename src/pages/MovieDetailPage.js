import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // NEW: Import useParams
import './MovieDetailPage.css'; // NEW: Create this CSS file

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // For poster images
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280'; // For larger background images

function MovieDetailPage() {
  const { id } = useParams(); // Get the movie ID from the URL
  const [movie, setMovie] = useState(null); // State to store movie details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      setError(null);

      if (!TMDB_API_KEY) {
        setError("TMDb API Key not found. Please check your .env.local file.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos` // Also fetch credits and videos
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Movie Details:", data); // Log to see the full data structure
        setMovie(data); // Set the full movie data

      } catch (err) {
        console.error("Error fetching movie details:", err);
        setError("Failed to fetch movie details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) { // Only fetch if an ID is available
      fetchMovie();
    }
  }, [id]); // Re-run effect if ID or API key changes

  // --- Conditional Rendering for Loading/Error States ---
  if (loading) {
    return <div className="movie-detail-container">Loading movie details...</div>;
  }

  if (error) {
    return <div className="movie-detail-container" style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!movie) { // If no movie data loaded and not loading/error
    return <div className="movie-detail-container">Movie not found.</div>;
  }

  // --- Destructure movie data for easier access ---
  const {
    title,
    overview,
    release_date,
    runtime,
    genres,
    vote_average,
    poster_path,
    backdrop_path,
    credits, // Includes cast
    videos   // Includes trailers
  } = movie;

  // Format release date (optional, for better display)
  const formattedReleaseDate = release_date ? new Date(release_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';

  // Get director (assuming first director in crew)
  const director = credits?.crew?.find(crew => crew.job === 'Director')?.name || 'N/A';

  // Get first few cast members
  const cast = credits?.cast?.slice(0, 5).map(actor => actor.name).join(', ') || 'N/A';

  // Find the official YouTube trailer
  const trailer = videos?.results?.find(video => video.site === 'YouTube' && video.type === 'Trailer' && video.official);
  const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;


  // --- Render the Movie Details ---
  return (
    <div className="movie-detail-page">
      {backdrop_path && (
        <div className="backdrop-overlay">
          <img
            src={`${BACKDROP_BASE_URL}${backdrop_path}`}
            alt={`${title} backdrop`}
            className="backdrop-image"
          />
        </div>
      )}

      <div className="movie-detail-content">
        <div className="poster-section">
          {poster_path ? (
            <img src={`${IMAGE_BASE_URL}${poster_path}`} alt={`${title} poster`} className="movie-poster" />
          ) : (
            <img src="https://via.placeholder.com/300x450?text=No+Poster" alt="No Poster" className="movie-poster" />
          )}
        </div>

        <div className="info-section">
          <h1>{title}</h1>
          <p className="tagline">{movie.tagline}</p> {/* Often has a short slogan */}

          <p><strong>Release Date:</strong> {formattedReleaseDate}</p>
          <p><strong>Runtime:</strong> {runtime ? `${runtime} minutes` : 'N/A'}</p>
          <p>
            <strong>Genres:</strong>{' '}
            {genres && genres.length > 0
              ? genres.map(genre => genre.name).join(', ')
              : 'N/A'}
          </p>
          <p><strong>Rating:</strong> {vote_average ? `${vote_average.toFixed(1)} / 10` : 'N/A'}</p>
          <p><strong>Director:</strong> {director}</p>
          <p><strong>Cast:</strong> {cast}</p>

          <h2>Overview</h2>
          <p>{overview || 'No overview available.'}</p>

          {trailerUrl && (
            <div className="trailer-section">
              <h3>Trailer</h3>
              <a href={trailerUrl} target="_blank" rel="noopener noreferrer" className="trailer-button">
                Watch Trailer
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;