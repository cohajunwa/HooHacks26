import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ProductCard from './components/ProductCard';
import type { Product, SearchResponse } from './types';
import styles from './App.module.css';

export default function App() {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(query: string) {
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const params = new URLSearchParams({ q: query });
      const base = import.meta.env.VITE_API_URL ?? '';
      const res = await fetch(`${base}/search?${params}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: SearchResponse = await res.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.logo}>threadsense</h1>
        {/* <p className={styles.tagline}>Sustainable fashion, beautifully found.</p> */}
        <SearchBar onSearch={handleSearch} loading={loading} />
      </header>

      <main className={styles.main}>
        {error && <p className={styles.error}>{error}</p>}

        {loading && (
          <div className={styles.emptyState}>
            <p>Searching…</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && !error && (
          <div className={styles.emptyState}>
            <p>No results found.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className={styles.grid}>
            {results.map((product, i) => (
              <ProductCard key={i} product={product} />
            ))}
          </div>
        )}

        {!searched && (
          <div className={styles.hero}>
            <p>Search for any clothing item to discover sustainable options.</p>
          </div>
        )}
      </main>
    </div>
  );
}
