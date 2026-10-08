import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export function SearchBar({ initialQuery = "", placeholder = "Search notes...", className = "" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [showClear, setShowClear] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
    setShowClear(!!initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    if (query.trim()) {
      params.set("search", query.trim());
    } else {
      params.delete("search");
    }
    navigate(`/notes?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery("");
    setShowClear(false);
    const params = new URLSearchParams(location.search);
    params.delete("search");
    navigate(`/notes?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowClear(!!e.target.value);
        }}
        className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
        aria-label="Search notes"
      />
      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </form>
  );
}