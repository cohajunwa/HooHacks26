import { useEffect, useRef, useState } from 'react';
import type { OutfitItem, Product } from '../types';
import ProductCard from './ProductCard';
import styles from './OutfitSection.module.css';

interface Props {
  item: OutfitItem;
  onSelect: (product: Product) => void;
}

function parsePrice(price: string): number | null {
  const n = parseFloat(price.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? null : n;
}

export default function OutfitSection({ item, onSelect }: Props) {
  const brands = Array.from(new Set(item.results.map(p => p.source).filter(Boolean)));

  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [brandOpen, setBrandOpen] = useState(false);
  const [minInput, setMinInput] = useState('');
  const [maxInput, setMaxInput] = useState('');
  const [appliedMin, setAppliedMin] = useState<number | null>(null);
  const [appliedMax, setAppliedMax] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close brand dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBrandOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function toggleBrand(brand: string) {
    setSelectedBrands(prev => {
      const next = new Set(prev);
      next.has(brand) ? next.delete(brand) : next.add(brand);
      return next;
    });
  }

  function applyPrice() {
    setAppliedMin(minInput !== '' ? parseFloat(minInput) : null);
    setAppliedMax(maxInput !== '' ? parseFloat(maxInput) : null);
  }

  const visibleResults = item.results.filter(p => {
    if (selectedBrands.size > 0 && !selectedBrands.has(p.source)) return false;
    const price = parsePrice(p.price);
    if (price !== null) {
      if (appliedMin !== null && price < appliedMin) return false;
      if (appliedMax !== null && price > appliedMax) return false;
    }
    return true;
  });

  const brandFilterActive = selectedBrands.size > 0;
  const priceFilterActive = appliedMin !== null || appliedMax !== null;

  return (
    <div className={styles.section}>
      <h3 className={styles.label}>{item.label}</h3>

      {/* Filter controls */}
      <div className={styles.filters}>
        {/* Brand filter */}
        <div className={styles.brandWrapper} ref={dropdownRef}>
          <button
            className={`${styles.filterBtn} ${brandFilterActive ? styles.filterBtnActive : ''}`}
            onClick={() => setBrandOpen(o => !o)}
          >
            Brand {brandFilterActive ? `(${selectedBrands.size})` : '▾'}
          </button>
          {brandOpen && (
            <div className={styles.dropdown}>
              {brands.length === 0 ? (
                <p className={styles.dropdownEmpty}>No brands available</p>
              ) : (
                brands.map(brand => (
                  <label key={brand} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedBrands.has(brand)}
                      onChange={() => toggleBrand(brand)}
                    />
                    {brand}
                  </label>
                ))
              )}
              {brandFilterActive && (
                <button className={styles.clearBtn} onClick={() => setSelectedBrands(new Set())}>
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Price filter */}
        <div className={styles.priceFilter}>
          <input
            className={styles.priceInput}
            type="number"
            min={0}
            placeholder="Min $"
            value={minInput}
            onChange={e => setMinInput(e.target.value)}
          />
          <span className={styles.priceSep}>–</span>
          <input
            className={styles.priceInput}
            type="number"
            min={0}
            placeholder="Max $"
            value={maxInput}
            onChange={e => setMaxInput(e.target.value)}
          />
          <button
            className={`${styles.applyBtn} ${priceFilterActive ? styles.filterBtnActive : ''}`}
            onClick={applyPrice}
            disabled={minInput === '' && maxInput === ''}
          >
            Apply
          </button>
          {priceFilterActive && (
            <button className={styles.clearBtn} onClick={() => {
              setMinInput(''); setMaxInput('');
              setAppliedMin(null); setAppliedMax(null);
            }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {visibleResults.length === 0 ? (
        <p className={styles.empty}>No results match your filters.</p>
      ) : (
        <div className={styles.row}>
          {visibleResults.map((product, i) => (
            <div key={i} className={styles.cardWrap}>
              <ProductCard product={product} onSelect={onSelect} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
