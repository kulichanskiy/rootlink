'use client';
import { useEffect } from 'react';
import styles from './Modal.module.css';

export default function Modal({ item, type, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!item) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">✕</button>

        {type === 'event' ? (
          <EventDetail event={item} />
        ) : (
          <ServiceDetail service={item} />
        )}
      </div>
    </div>
  );
}

function EventDetail({ event }) {
  return (
    <>
      <div className={styles.banner} style={{ '--clr': event.color }}>
        <span className={styles.bannerEmoji}>{event.emoji}</span>
        <span className={styles.bannerTag}>{event.category}</span>
      </div>
      <div className={styles.content}>
        <h2 className={styles.title}>{event.title}</h2>
        <p className={styles.desc}>{event.description}</p>

        <div className={styles.detailGrid}>
          <Detail icon="📅" label="Date & Time" value={event.date} />
          <Detail icon="📍" label="Location" value={event.location} />
          <Detail icon="👥" label="Capacity" value={`${event.capacity - event.spots} / ${event.capacity} joined`} />
          <Detail icon="🌐" label="Languages" value={event.languages.join(', ')} />
          <Detail icon="🏷️" label="Category" value={event.category} />
          <Detail icon="✅" label="Approval" value="Host reviews each request" />
        </div>

        <div className={styles.hostRow}>
          <div className={styles.hostAvatar} style={{ '--hue': event.hostHue }}>
            {event.host[0]}
          </div>
          <div>
            <p className={styles.hostLabel}>Hosted by</p>
            <p className={styles.hostName}>{event.host}</p>
          </div>
        </div>

        <button className={styles.actionBtn}>Request to Join</button>
      </div>
    </>
  );
}

function ServiceDetail({ service }) {
  return (
    <>
      <div className={styles.content} style={{ paddingTop: 32 }}>
        <div className={styles.serviceHeader}>
          <div className={styles.serviceAvatar} style={{ '--hue': service.hue }}>
            {service.provider[0]}
          </div>
          <div>
            <h2 className={styles.title}>{service.title}</h2>
            <p className={styles.providerName}>{service.provider}</p>
          </div>
          <div className={styles.ratingBig}>★ {service.rating}</div>
        </div>

        <p className={styles.desc}>{service.desc}</p>

        <div className={styles.detailGrid}>
          <Detail icon="🌐" label="Languages" value={service.languages.join(', ')} />
          <Detail icon="🏷️" label="Category" value={service.category} />
          <Detail icon="💰" label="Pricing" value={service.price} />
          <Detail icon="📅" label="Member since" value={service.since} />
          <Detail icon="⭐" label="Rating" value={`${service.rating} / 5`} />
          <Detail icon="✅" label="Availability" value="Message to book" />
        </div>

        <div className={styles.reviewsSection}>
          <h4 className={styles.reviewsTitle}>Community Reviews</h4>
          {service.reviews?.map((r, i) => (
            <div key={i} className={styles.review}>
              <div className={styles.reviewAvatar} style={{ '--hue': r.hue }}>{r.name[0]}</div>
              <div>
                <p className={styles.reviewerName}>{r.name} <span>{'★'.repeat(r.stars)}</span></p>
                <p className={styles.reviewText}>{r.text}</p>
              </div>
            </div>
          ))}
        </div>

        <button className={styles.actionBtn}>Contact {service.provider}</button>
      </div>
    </>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div className={styles.detail}>
      <span className={styles.detailIcon}>{icon}</span>
      <div>
        <p className={styles.detailLabel}>{label}</p>
        <p className={styles.detailValue}>{value}</p>
      </div>
    </div>
  );
}
