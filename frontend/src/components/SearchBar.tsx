import { useState, type FormEvent } from 'react';
import styles from './SearchBar.module.css';

interface Props {
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [value, setValue] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q) onSearch(q);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        placeholder="Search for clothing items…"
        value={value}
        onChange={e => setValue(e.target.value)}
        disabled={loading}
      />
      <button className={styles.button} type="submit" disabled={loading || !value.trim()}>
        {loading ? '…' : 'Search'}
      </button>
    </form>
  );
}
