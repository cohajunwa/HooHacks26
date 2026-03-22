import { useEffect, useRef, useState } from 'react';
import styles from './BrandPicker.module.css';

interface Brand {
  name: string;
  domain: string;
}

interface Props {
  selectedBrands: Set<string>;
  onChange: (brands: Set<string>) => void;
}

export default function BrandPicker({ selectedBrands, onChange }: Props) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const base = import.meta.env.VITE_API_URL ?? '';
    fetch(`${base}/brands`)
      .then(r => r.json())
      .then(setBrands)
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function toggle(name: string) {
    const next = new Set(selectedBrands);
    next.has(name) ? next.delete(name) : next.add(name);
    onChange(next);
  }

  const active = selectedBrands.size > 0;

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={`${styles.trigger} ${active ? styles.triggerActive : ''}`}
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        {active ? `Brands (${selectedBrands.size})` : 'All Brands ▾'}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <p className={styles.hint}>Showing results from:</p>
          {brands.map(b => (
            <label key={b.name} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedBrands.has(b.name)}
                onChange={() => toggle(b.name)}
              />
              {b.name}
            </label>
          ))}
          {active && (
            <button className={styles.clearBtn} onClick={() => onChange(new Set())}>
              Clear — show all brands
            </button>
          )}
        </div>
      )}
    </div>
  );
}
