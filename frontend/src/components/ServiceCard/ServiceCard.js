'use client';
import { useState } from 'react';
import styles from './ServiceCard.module.css';

export default function ServiceCard({ service, onOpen }) {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div className={styles.card} onClick={() => onOpen(service)}>
      <button
        className={`${styles.bookmark} ${bookmarked ? styles.bookmarked : ''}`}
        onClick={(e) => { e.stopPropagation(); setBookmarked(b => !b); }}
        aria-label="Bookmark service"
      >
        {bookmarked ? '♥' : '♡'}
      </button>

      <div className={styles.providerRow}>
        <div className={styles.avatar} style={{ '--hue': service.hue }}>
          {service.provider[0]}
        </div>
        <div>
          <p className={styles.providerName}>{service.provider}</p>
          <p className={styles.providerSince}>Member since {service.since}</p>
        </div>
        <div className={styles.rating}>
          ★ <span>{service.rating}</span>
        </div>
      </div>

      <h3 className={styles.title}>{service.title}</h3>
      <p className={styles.desc}>{service.desc}</p>

      <div className={styles.tags}>
        {service.languages.map(l => (
          <span key={l} className={styles.langTag}>{l}</span>
        ))}
        <span className={styles.catTag}>{service.category}</span>
      </div>

      <div className={styles.footer}>
        <span className={styles.price}>{service.price}</span>
        <button className={styles.contactBtn} onClick={e => { e.stopPropagation(); onOpen(service); }}>
          Contact
        </button>
      </div>
    </div>
  );
}
