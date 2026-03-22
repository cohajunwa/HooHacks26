import type { OutfitItem, Product } from '../types';
import ProductCard from './ProductCard';
import styles from './OutfitSection.module.css';

interface Props {
  item: OutfitItem;
  onSelect: (product: Product) => void;
}

export default function OutfitSection({ item, onSelect }: Props) {
  return (
    <div className={styles.section}>
      <h3 className={styles.label}>{item.label}</h3>
      {item.results.length === 0 ? (
        <p className={styles.empty}>No results found for this item.</p>
      ) : (
        <div className={styles.row}>
          {item.results.map((product, i) => (
            <div key={i} className={styles.cardWrap}>
              <ProductCard product={product} onSelect={onSelect} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
