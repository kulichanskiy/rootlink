'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';

const ROTATING_WORDS = ['community', 'belonging', 'connection', 'home'];

const FLOATING_CARDS = [
  { emoji: '⚽', title: 'Sunday Football',    tag: 'Sports',   lang: 'FR / EN',   slots: '3 left',  color: '#6A9E72' },
  { emoji: '✂️', title: 'Haircut by Amara',   tag: 'Service',  lang: 'AM / EN',   slots: 'Open',    color: '#C97B4B' },
  { emoji: '🍜', title: 'Dumpling Making',    tag: 'Culture',  lang: 'ZH / EN',   slots: '5 left',  color: '#5B9DC9' },
  { emoji: '📚', title: 'Math Tutoring',      tag: 'Service',  lang: 'FA / EN',   slots: 'Open',    color: '#D4A034' },
  { emoji: '🏀', title: 'Basketball Pickup',  tag: 'Sports',   lang: 'ES / EN',   slots: '2 left',  color: '#E8846A' },
];

export default function Hero() {
  const [wordIdx, setWordIdx]   = useState(0);
  const [fading,  setFading]    = useState(false);
  const [mouse,   setMouse]     = useState({ x: 0, y: 0 });
  const heroRef                 = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setWordIdx(i => (i + 1) % ROTATING_WORDS.length);
        setFading(false);
      }, 350);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      const { innerWidth: W, innerHeight: H } = window;
      setMouse({ x: (e.clientX / W - 0.5) * 2, y: (e.clientY / H - 0.5) * 2 });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const px = (depth) => ({
    transform: `translate(${mouse.x * depth}px, ${mouse.y * depth}px)`,
  });

  return (
    <section className={styles.hero} ref={heroRef}>
      <div className={styles.orb1} style={px(18)} />
      <div className={styles.orb2} style={px(28)} />
      <div className={styles.orb3} style={px(12)} />

      <div className={styles.grain} />

      <div className={styles.ring} style={px(8)} />

      <div className={styles.inner}>
        <div className={styles.headlineWrap}>
          <p className={styles.eyebrow}>🍁 Newcomers in Canada</p>

          <h1 className={styles.headline}>
            Find your{' '}
            <span className={`${styles.rotating} ${fading ? styles.fade : ''}`}>
              {ROTATING_WORDS[wordIdx]}
            </span>
            <br />in your city.
          </h1>

          <p className={styles.sub}>
            RootLink connects immigrants with local events, cultural meetups, and
            community services — all in your language.
          </p>

          <div className={styles.actions}>
            <Link href="/events" className={styles.btnPrimary}>
              Explore Events
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/services" className={styles.btnSecondary}>
              Find Services
            </Link>
          </div>

          <div className={styles.stats}>
            {[
              { n: '2,400+', label: 'members' },
              { n: '180+',   label: 'events' },
              { n: '35+',    label: 'languages' },
            ].map(s => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statN}>{s.n}</span>
                <span className={styles.statL}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.cardsWrap} style={px(10)}>
          {FLOATING_CARDS.map((card, i) => (
            <FloatingCard key={card.title} card={card} index={i} />
          ))}
        </div>
      </div>

      <div className={styles.scrollHint}>
        <span>scroll</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}

function FloatingCard({ card, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`${styles.floatCard} ${hovered ? styles.floatCardHovered : ''}`}
      style={{ '--i': index, '--accent': card.color }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className={styles.cardEmoji}>{card.emoji}</span>
      <div className={styles.cardBody}>
        <span className={styles.cardTitle}>{card.title}</span>
        <span className={styles.cardMeta}>
          <span className={styles.cardTag}>{card.tag}</span>
          <span className={styles.cardLang}>{card.lang}</span>
        </span>
      </div>
      <span className={styles.cardSlots}>{card.slots}</span>
    </div>
  );
}
