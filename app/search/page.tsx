'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  score: number;
  metadata?: Record<string, any>;
}

interface FilterOption {
  label: string;
  value: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateRange: '',
  });
  const [availableFilters, setAvailableFilters] = useState<Record<string, FilterOption[]>>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch('/api/search/filters');
        const data = await response.json();
        setAvailableFilters(data);
      } catch (error) {
        console.error('Failed to fetch filters:', error);
      }
    };

    fetchFilters();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        query,
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      order: 'bg-blue-100 text-blue-800',
      invoice: 'bg-green-100 text-green-800',
      document: 'bg-purple-100 text-purple-800',
      product: 'bg-orange-100 text-orange-800',
      client: 'bg-pink-100 text-pink-800',
      supplier: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Global Search</h1>
        <p className="text-gray-600">Search across all your business data</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, invoices, documents, products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">All Types</option>
                    {availableFilters.types?.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">All Statuses</option>
                    {availableFilters.statuses?.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">All Time</option>
                    {availableFilters.dateRanges?.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>

      {/* Results */}
      <div className="space-y-4">
        {results.length > 0 ? (
          <>
            <p className="text-sm text-gray-600">Found {results.length} results</p>
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(result.type)}`}>
                          {result.type.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">Score: {result.score.toFixed(2)}</span>
                      </div>
                      <h3 className="text-lg font-semibold">{result.title}</h3>
                      {result.description && (
                        <p className="text-gray-600 text-sm mt-1">{result.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : query && !loading ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              No results found for "{query}"
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

