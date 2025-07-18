import React from 'react';
import './MovieCard.css';
import { Link } from 'react-router-dom'; // NEW: Import Link

function MovieCard(props) {
  // Destructure 'id' from props.movie for the link
  const { id, title, imageUrl, releaseDate } = props.movie; // Adjusted to destructure props.movie

  return (
    // NEW: Wrap the movie card with a Link component
    <Link to={`/movie/${id}`} className="movie-card-link"> {/* Link to the movie detail page */}
      <div className="movie-card">
        <h2>{title}</h2>
        <img src={imageUrl} alt={title} />
        <p>{releaseDate}</p>
      </div>
    </Link>
  );
}

export default MovieCard;