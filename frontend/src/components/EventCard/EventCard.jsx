'use client';
import { useState } from 'react';
import styles from './EventCard.module.css';

export default function EventCard({ event, onOpen }) {
  const [joining, setJoining] = useState(false);
  const [joined,  setJoined]  = useState(false);

  const handleJoin = (e) => {
    e.stopPropagation();
    setJoining(true);
    setTimeout(() => { setJoining(false); setJoined(true); }, 1000);
  };

  const pct = Math.round(((event.capacity - event.spots) / event.capacity) * 100);

  return (
    <div className={styles.card} onClick={() => onOpen(event)}>
      <div className={styles.header} style={{ '--clr': event.color }}>
        <span className={styles.emoji}>{event.emoji}</span>
        <span className={styles.tag}>{event.category}</span>
        {event.spots <= 3 && (
          <span className={styles.urgent}>🔥 {event.spots} left</span>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{event.title}</h3>

        <div className={styles.meta}>
          <span>📅 {event.date}</span>
          <span>📍 {event.location}</span>
          <span>🌐 {event.languages.join(' · ')}</span>
        </div>

        <div className={styles.progress}>
          <div className={styles.progressBar} style={{ '--pct': `${pct}%` }} />
        </div>
        <p className={styles.spots}>
          {event.spots} of {event.capacity} spots remaining
        </p>

        <div className={styles.footer}>
          <div className={styles.avatars}>
            {event.attendees.map((a, i) => (
              <div key={i} className={styles.avatar} style={{ '--hue': a }}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            {event.capacity - event.spots > 3 && (
              <div className={styles.avatarMore}>+{event.capacity - event.spots - 3}</div>
            )}
          </div>

          <button
            className={`${styles.joinBtn} ${joined ? styles.joined : ''} ${joining ? styles.joining : ''}`}
            onClick={handleJoin}
            disabled={joined || joining}
          >
            {joining ? '⏳' : joined ? '✓ Requested' : 'Request to Join'}
          </button>
        </div>
      </div>
    </div>
  );
}
