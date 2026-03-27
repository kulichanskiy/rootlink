'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { href: '/',         label: 'Home'     },
  { href: '/events',   label: 'Events'   },
  { href: '/services', label: 'Services' },
  { href: '/about',    label: 'About'    },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <Link href="/" className={styles.logo}>
        <span className={styles.logoMark}>RL</span>
        <span className={styles.logoText}>RootLink</span>
      </Link>

      <ul className={`${styles.links} ${open ? styles.mobileOpen : ''}`}>
        {NAV_LINKS.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className={styles.link} onClick={() => setOpen(false)}>
              {label}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/join" className={styles.cta} onClick={() => setOpen(false)}>
            Join Free
          </Link>
        </li>
      </ul>

      <button
        className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>
    </nav>
  );
}
