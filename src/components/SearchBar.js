import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const term = e.target.value; // Get the new term
    setSearchTerm(term);         // Update local state

    // NEW: Call onSearch immediately on every change
    // This allows the parent (App.js) to react to an empty search term
    onSearch(term);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // The onSearch(searchTerm) is now handled by handleChange,
    // but we keep this here to ensure the latest, committed search term
    // is processed on explicit submission, even if it's empty.
    onSearch(searchTerm);

    if (window.location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        placeholder="Search for movies or TV shows..."
        value={searchTerm}
        onChange={handleChange} // This is already calling handleChange
      />
      <button type="submit">Search</button>
    </form>
  );
}

export default SearchBar;