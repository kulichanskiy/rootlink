'use client';
import styles from './FilterBar.module.css';

export default function FilterBar({ categories, onFilter, activeFilter }) {
  return (
    <div className={styles.bar}>
      {['All', ...categories].map(cat => (
        <button
          key={cat}
          className={`${styles.pill} ${activeFilter === cat ? styles.active : ''}`}
          onClick={() => onFilter(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
