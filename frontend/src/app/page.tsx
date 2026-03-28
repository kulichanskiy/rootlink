"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import EventCard from "../components/EventCard/EventCard";
import ServiceCard from "../components/ServiceCard/ServiceCard";
import Modal from "../components/Modal/Modal";
import CursorBlob from "../components/CursorBlob/CursorBlob";
import { EVENTS, SERVICES } from "../lib/data";
import { fetchEvents, fetchServices } from "../lib/api";
import type { UiEvent, UiService } from "../lib/api";
import styles from "./page.module.css";

type ModalState = {
  item: unknown;
  type: "event" | "service";
};

export default function Home() {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [featuredEvents, setFeaturedEvents] = useState<UiEvent[]>(EVENTS.slice(0, 3));
  const [featuredServices, setFeaturedServices] = useState<UiService[]>(
    SERVICES.slice(0, 3),
  );

  useEffect(() => {
    let active = true;

    Promise.all([fetchEvents(), fetchServices()])
      .then(([events, services]) => {
        if (!active) return;
        setFeaturedEvents(
          events.length > 0 ? events.slice(0, 3) : [],
        );
        setFeaturedServices(
          services.length > 0 ? services.slice(0, 3) : [],
        );
      })
      .catch(() => {
        if (!active) return;
        setFeaturedEvents(EVENTS.slice(0, 3));
        setFeaturedServices(SERVICES.slice(0, 3));
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <CursorBlob />
      <Navbar />
      <main>
        <Hero />

        <section className={styles.howSection}>
          <div className={styles.sectionInner}>
            <p className={styles.sectionEyebrow}>Simple by design</p>
            <h2 className={styles.sectionTitle}>How RootLink works</h2>
            <div className={styles.stepsGrid}>
              {[
                {
                  n: "01",
                  icon: "🌍",
                  title: "Create your profile",
                  desc: "Tell us your languages, interests, and neighbourhood. Takes 2 minutes.",
                },
                {
                  n: "02",
                  icon: "🔍",
                  title: "Discover or post",
                  desc: "Browse local events and services filtered by language and category.",
                },
                {
                  n: "03",
                  icon: "🤝",
                  title: "Connect & attend",
                  desc: "Request to join events or message service providers directly.",
                },
              ].map((step) => (
                <div key={step.n} className={styles.step}>
                  <div className={styles.stepNum}>{step.n}</div>
                  <span className={styles.stepIcon}>{step.icon}</span>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.sectionEyebrow}>Happening near you</p>
                <h2 className={styles.sectionTitle}>Upcoming Events</h2>
              </div>
              <a href="/events" className={styles.seeAll}>
                See all events →
              </a>
            </div>
            <div className={styles.cardGrid}>
              {featuredEvents.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  onOpen={(item: unknown) => setModal({ item, type: "event" })}
                />
              ))}
            </div>
          </div>
        </section>

        <div className={styles.marqueeWrap}>
          <div className={styles.marquee}>
            {[
              "🇺🇦 Ukrainian",
              "🇵🇭 Filipino",
              "🇮🇳 Hindi",
              "🇨🇳 Mandarin",
              "🇰🇷 Korean",
              "🇸🇦 Arabic",
              "🇪🇸 Spanish",
              "🇮🇷 Farsi",
              "🇵🇹 Portuguese",
              "🇫🇷 French",
              "🇪🇹 Amharic",
              "🇵🇰 Urdu",
              "🇯🇵 Japanese",
              "🇻🇳 Vietnamese",
              "🇮🇩 Bahasa",
              "🇹🇷 Turkish",
              "🇵🇭 Filipino",
              "🇮🇳 Hindi",
              "🇨🇳 Mandarin",
              "🇰🇷 Korean",
              "🇸🇦 Arabic",
              "🇪🇸 Spanish",
              "🇮🇷 Farsi",
              "🇵🇹 Portuguese",
              "🇫🇷 French",
              "🇪🇹 Amharic",
              "🇵🇰 Urdu",
              "🇯🇵 Japanese",
              "🇻🇳 Vietnamese",
              "🇮🇩 Bahasa",
              "🇹🇷 Turkish",
            ].map((lang, i) => (
              <span key={i} className={styles.marqueeItem}>
                {lang}
              </span>
            ))}
          </div>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.sectionEyebrow}>
                  Trusted by your community
                </p>
                <h2 className={styles.sectionTitle}>Community Services</h2>
              </div>
              <a href="/services" className={styles.seeAll}>
                See all services →
              </a>
            </div>
            <div className={styles.cardGrid}>
              {featuredServices.map((sv) => (
                <ServiceCard
                  key={sv.id}
                  service={sv}
                  onOpen={(item: unknown) =>
                    setModal({ item, type: "service" })
                  }
                />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaBanner}>
          <div className={styles.ctaOrb1} />
          <div className={styles.ctaOrb2} />
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to find your people?</h2>
            <p className={styles.ctaDesc}>
              Join thousands of newcomers building community across Canada, one
              event at a time.
            </p>
            <div className={styles.ctaActions}>
              <a href="/join" className={styles.ctaBtn}>
                Get Started — It&apos;s Free
              </a>
              <a href="/events" className={styles.ctaBtnGhost}>
                Browse Events
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>RL</div>
            <div>
              <p className={styles.footerName}>RootLink</p>
              <p className={styles.footerTagline}>
                Find your community in Canada.
              </p>
            </div>
          </div>
          <div className={styles.footerLinks}>
            {["Events", "Services", "About", "Contact", "Privacy"].map((l) => (
              <a key={l} href="#" className={styles.footerLink}>
                {l}
              </a>
            ))}
          </div>
          <p className={styles.footerCopy}>
            © 2025 RootLink. Built with ♥ for newcomers.
          </p>
        </div>
      </footer>

      {modal && (
        <Modal
          item={modal.item}
          type={modal.type}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
