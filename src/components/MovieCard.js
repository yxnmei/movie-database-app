// src/components/MovieCard.js (create this new file and folder)
import React from 'react';
import './MovieCard.css'; // We'll add this later

function MovieCard(props) { // props is an object containing all passed props
  return (
    <div className="movie-card">
      <h2>{props.title}</h2>
      <img src={props.imageUrl} alt={props.title} />
      <p>{props.releaseDate}</p>
    </div>
  );
}

export default MovieCard;