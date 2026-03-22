import { useEffect } from 'react';
import type { Product } from '../types';
import styles from './ProductModal.module.css';

const RATING_COLORS: Record<string, string> = {
  'champion':      '#4a7c59',
  'great':         '#6a9e6f',
  'good':          '#a3b86c',
  "it's a start":  '#c9a84c',
  'we avoid':      '#c0614a',
};

interface Props {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const ratingColor = product.sustainability_rating
    ? RATING_COLORS[product.sustainability_rating.toLowerCase()] ?? '#888'
    : null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        <div className={styles.imageWrap}>
          {product.thumbnail ? (
            <img src={product.thumbnail} alt={product.title} className={styles.image} />
          ) : (
            <div className={styles.imagePlaceholder} />
          )}
        </div>

        <div className={styles.body}>
          <p className={styles.source}>{product.source}</p>
          <h2 className={styles.title}>{product.title}</h2>
          <p className={styles.price}>{product.price}</p>

          {product.sustainability_rating && ratingColor && (
            <div className={styles.ratingRow}>
              {/* <span className={styles.ratingLabel}>Good on You</span> */}
              <span className={styles.badge} style={{ background: ratingColor }}>
                {product.sustainability_rating}
              </span>
            </div>
          )}

          <a
            href={product.product_link ?? product.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaBtn}
          >
            View listing →
          </a>
        </div>
      </div>
    </div>
  );
}
