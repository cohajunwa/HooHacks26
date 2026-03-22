import type { Product } from '../types';
import styles from './ProductCard.module.css';

const RATING_COLORS: Record<string, string> = {
  'champion':      '#4a7c59',
  'great':         '#6a9e6f',
  'good':          '#a3b86c',
  "it's a start":  '#c9a84c',
  'we avoid':      '#c0614a',
};

function RatingBadge({ rating }: { rating: string }) {
  const color = RATING_COLORS[rating.toLowerCase()] ?? '#888';
  return (
    <span className={styles.badge} style={{ background: color }}>
      {rating}
    </span>
  );
}

interface Props {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: Props) {
  return (
    <button className={styles.card} onClick={() => onSelect(product)}>
      <div className={styles.imageWrap}>
        {product.thumbnail ? (
          <img src={product.thumbnail} alt={product.title} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
      </div>

      <div className={styles.body}>
        <p className={styles.source}>{product.source}</p>
        <p className={styles.title}>{product.title}</p>
        <div className={styles.footer}>
          <span className={styles.price}>{product.price}</span>
          {product.sustainability_rating && (
            <RatingBadge rating={product.sustainability_rating} />
          )}
        </div>
      </div>
    </button>
  );
}
