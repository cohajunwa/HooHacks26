import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ProductCard from './components/ProductCard';
import FilterBar, { type GoyRating } from './components/FilterBar';
import ProductModal from './components/ProductModal';
import StyleAssistant from './components/StyleAssistant';
import type { FilterGroup, Product, SearchResponse } from './types';
import styles from './App.module.css';

type Tab = 'search' | 'style';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [results, setResults] = useState<Product[]>([]);
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<GoyRating | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(
    query: string,
    shoprs?: string,
    minPrice?: number | null,
    maxPrice?: number | null,
  ) {
    setLoading(true);
    setError(null);
    setSearched(true);
    setCurrentQuery(query);
    if (!shoprs) setSelectedRating(null);

    try {
      const params = new URLSearchParams({ q: query });
      if (shoprs) params.set('shoprs', shoprs);
      if (minPrice != null) params.set('min_price', String(minPrice));
      if (maxPrice != null) params.set('max_price', String(maxPrice));

      const base = import.meta.env.VITE_API_URL ?? '';
      const res = await fetch(`${base}/search?${params}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: SearchResponse = await res.json();
      setResults(data.results);
      setFilterGroups(data.filter_groups ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setResults([]);
      setFilterGroups([]);
    } finally {
      setLoading(false);
    }
  }

  const visibleResults = selectedRating
    ? results.filter(p => p.sustainability_rating?.toLowerCase() === selectedRating.toLowerCase())
    : results;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.logo}>threadsense</h1>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'search' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Search
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'style' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('style')}
          >
            Style Assistant
          </button>
        </div>

        {activeTab === 'search' && (
          <SearchBar onSearch={q => handleSearch(q)} loading={loading} />
        )}
      </header>

      {activeTab === 'search' ? (
        <main className={styles.main}>
          {searched && filterGroups.length > 0 && (
            <aside className={styles.sidebar}>
              <FilterBar
                filterGroups={filterGroups}
                onSelectFilter={shoprs => handleSearch(currentQuery, shoprs)}
                onPriceRange={(min, max) => handleSearch(currentQuery, undefined, min, max)}
                selectedRating={selectedRating}
                onRatingChange={setSelectedRating}
                disabled={loading}
              />
            </aside>
          )}

          <div className={styles.content}>
            {error && <p className={styles.error}>{error}</p>}

            {loading && (
              <div className={styles.emptyState}>
                <p>Searching…</p>
              </div>
            )}

            {!loading && searched && visibleResults.length === 0 && !error && (
              <div className={styles.emptyState}>
                <p>No results found.</p>
              </div>
            )}

            {!loading && visibleResults.length > 0 && (
              <div className={styles.grid}>
                {visibleResults.map((product, i) => (
                  <ProductCard key={i} product={product} onSelect={setSelectedProduct} />
                ))}
              </div>
            )}

            {!searched && (
              <div className={styles.hero}>
                <p>Search for any clothing item to discover sustainable options.</p>
              </div>
            )}
          </div>
        </main>
      ) : (
        <StyleAssistant />
      )}

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
