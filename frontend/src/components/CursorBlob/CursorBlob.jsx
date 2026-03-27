'use client';
import { useEffect, useRef } from 'react';
import styles from './CursorBlob.module.css';

export default function CursorBlob() {
  const dotRef  = useRef(null);
  const blobRef = useRef(null);
  const pos     = useRef({ x: -200, y: -200 });
  const blob    = useRef({ x: -200, y: -200 });

  useEffect(() => {
    let mounted = true;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    const lerp = (a, b, t) => a + (b - a) * t;

    let raf;
    const tick = () => {
      if (!mounted || !blobRef.current) return;
      blob.current.x = lerp(blob.current.x, pos.current.x, 0.1);
      blob.current.y = lerp(blob.current.y, pos.current.y, 0.1);
      blobRef.current.style.transform =
        `translate(${blob.current.x}px, ${blob.current.y}px)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);

    // grow on hover over links/buttons
    const grow  = () => blobRef.current?.classList.add(styles.grow);
    const shrink = () => blobRef.current?.classList.remove(styles.grow);

    const interactiveEls = document.querySelectorAll('a, button, [role="button"]');
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', grow);
      el.addEventListener('mouseleave', shrink);
    });

    return () => {
      mounted = false;
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      interactiveEls.forEach(el => {
        el.removeEventListener('mouseenter', grow);
        el.removeEventListener('mouseleave', shrink);
      });
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className={styles.dot}  />
      <div ref={blobRef} className={styles.blob} />
    </>
  );
}
