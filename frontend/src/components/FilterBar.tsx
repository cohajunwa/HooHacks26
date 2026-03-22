import { useState } from 'react';
import type { FilterGroup } from '../types';
import styles from './FilterBar.module.css';

const GOY_RATINGS = ["Champion", "Great", "Good", "It's a start", "We avoid"] as const;
export type GoyRating = typeof GOY_RATINGS[number];

interface Props {
  filterGroups: FilterGroup[];
  onSelectFilter: (shoprs: string) => void;
  onPriceRange: (min: number | null, max: number | null) => void;
  // selectedRating: GoyRating | null;
  // onRatingChange: (rating: GoyRating | null) => void;
  disabled: boolean;
}

function PriceRangeGroup({
  onPriceRange,
  disabled,
}: {
  onPriceRange: Props['onPriceRange'];
  disabled: boolean;
}) {
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  function handleApply() {
    onPriceRange(
      min !== '' ? parseFloat(min) : null,
      max !== '' ? parseFloat(max) : null,
    );
  }

  return (
    <div className={styles.group}>
      <span className={styles.groupLabel}>Price range</span>
      <div className={styles.priceInputs}>
        <input
          className={styles.priceInput}
          type="number"
          min={0}
          placeholder="Min $"
          value={min}
          onChange={e => setMin(e.target.value)}
          disabled={disabled}
        />
        <span className={styles.priceSep}>–</span>
        <input
          className={styles.priceInput}
          type="number"
          min={0}
          placeholder="Max $"
          value={max}
          onChange={e => setMax(e.target.value)}
          disabled={disabled}
        />
        <button
          className={styles.applyBtn}
          onClick={handleApply}
          disabled={disabled || (min === '' && max === '')}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

export default function FilterBar({ filterGroups, onSelectFilter, onPriceRange, selectedRating, onRatingChange, disabled }: Props) {
  const priceRangeGroup = filterGroups.find(g => g.input_type === 'price_range');
  const discreteGroups = filterGroups.filter(g => g.input_type !== 'price_range');

  return (
    <div className={styles.bar}>
      {/* <div className={styles.group}>
        <span className={styles.groupLabel}>Good on You score</span>
        <div className={styles.chips}>
          {GOY_RATINGS.map(rating => (
            <button
              key={rating}
              className={`${styles.chip} ${selectedRating === rating ? styles.chipActive : ''}`}
              onClick={() => onRatingChange(selectedRating === rating ? null : rating)}
              disabled={disabled}
            >
              {rating}
            </button>
          ))}
        </div>
      </div> */}

      {discreteGroups.length > 0 && <hr className={styles.divider} />}

      {discreteGroups.map(group => (
        <div key={group.type} className={styles.group}>
          <span className={styles.groupLabel}>{group.type}</span>
          <div className={styles.chips}>
            {group.options.map(option => (
              <button
                key={option.shoprs}
                className={`${styles.chip} ${option.selected ? styles.chipActive : ''}`}
                onClick={() => onSelectFilter(option.shoprs)}
                disabled={disabled}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      ))}

      {priceRangeGroup !== undefined && (
        <PriceRangeGroup onPriceRange={onPriceRange} disabled={disabled} />
      )}
    </div>
  );
}
