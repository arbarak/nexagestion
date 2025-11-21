'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  score: number;
}

export default function GlobalSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (value: string) => {
    setQuery(value);

    if (value.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(value)}&limit=5`);
      const data = await response.json();
      setResults(data.results || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      order: 'bg-blue-50 text-blue-700',
      invoice: 'bg-green-50 text-green-700',
      document: 'bg-purple-50 text-purple-700',
      product: 'bg-orange-50 text-orange-700',
      client: 'bg-pink-50 text-pink-700',
    };
    return colors[type] || 'bg-gray-50 text-gray-700';
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search (Cmd+K)..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length > 0 && setShowResults(true)}
          className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {loading && <Loader className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50">
          <div className="max-h-96 overflow-y-auto">
            {results.map((result) => (
              <Link
                key={result.id}
                href={`/${result.type}/${result.id}`}
                className={`block px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 ${getTypeColor(result.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{result.title}</p>
                    {result.description && (
                      <p className="text-xs text-gray-600 mt-1">{result.description}</p>
                    )}
                  </div>
                  <span className="text-xs font-medium ml-2 px-2 py-1 bg-white rounded">
                    {result.type}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            className="block px-4 py-3 text-center text-sm text-blue-600 hover:bg-blue-50 border-t font-medium"
          >
            View all results
          </Link>
        </div>
      )}
    </div>
  );
}

