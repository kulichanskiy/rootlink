"use client";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Navbar from "../../components/Navbar/Navbar";
import EventCard from "../../components/EventCard/EventCard";
import FilterBar from "../../components/FilterBar/FilterBar";
import Modal from "../../components/Modal/Modal";
import CursorBlob from "../../components/CursorBlob/CursorBlob";
import { EVENTS, EVENT_CATEGORIES } from "../../lib/data";
import { fetchEvents } from "../../lib/api";
import type { UiEvent } from "../../lib/api";
import styles from "./page.module.css";

type ModalState = {
  item: unknown;
  type: "event" | "service";
};

type PostEventFormProps = {
  onClose: () => void;
};

export default function EventsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState<UiEvent[]>(EVENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleFilterChange = (nextFilter: string) => {
    setFilter(nextFilter);
    setIsLoading(true);
    setLoadError(null);
  };

  useEffect(() => {
    let active = true;

    fetchEvents(filter)
      .then((items) => {
        if (!active) return;
        setEvents(items.length > 0 ? items : []);
      })
      .catch(() => {
        if (!active) return;
        setLoadError("Could not load events from backend. Showing local data.");
        setEvents(
          EVENTS.filter((ev) => filter === "All" || ev.category === filter),
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filter]);

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      const matchSearch =
        ev.title.toLowerCase().includes(search.toLowerCase()) ||
        ev.location.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [events, search]);

  return (
    <>
      <CursorBlob />
      <Navbar />
      <main className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderInner}>
            <p className={styles.eyebrow}>🍁 Surrey & Metro Vancouver</p>
            <h1 className={styles.pageTitle}>Community Events</h1>
            <p className={styles.pageSub}>
              Small, approval-based gatherings where newcomers connect for real.
            </p>
            <button
              className={styles.postBtn}
              onClick={() => setShowForm(true)}
            >
              + Post an Event
            </button>
          </div>
          <div className={styles.pageHeaderDecor} />
        </div>

        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search events or locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.clearBtn} onClick={() => setSearch("")}>
                ✕
              </button>
            )}
          </div>
          <FilterBar
            categories={EVENT_CATEGORIES}
            activeFilter={filter}
            onFilter={handleFilterChange}
          />
        </div>
        {loadError && <p className={styles.pageSub}>{loadError}</p>}

        <div className={styles.grid}>
          {!isLoading && filtered.length === 0 ? (
            <div className={styles.empty}>
              <span>😔</span>
              <p>No events match your search. Try a different filter.</p>
            </div>
          ) : isLoading ? (
            <div className={styles.empty}>
              <span>⏳</span>
              <p>Loading events...</p>
            </div>
          ) : (
            filtered.map((ev, i) => (
              <div
                key={ev.id}
                className={styles.cardWrap}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <EventCard
                  event={ev}
                  onOpen={(item: unknown) => setModal({ item, type: "event" })}
                />
              </div>
            ))
          )}
        </div>
      </main>

      {modal && (
        <Modal
          item={modal.item}
          type={modal.type}
          onClose={() => setModal(null)}
        />
      )}

      {showForm && <PostEventForm onClose={() => setShowForm(false)} />}
    </>
  );
}

function PostEventForm({ onClose }: PostEventFormProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className={styles.formOverlay} onClick={onClose}>
      <div className={styles.formModal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.formClose} onClick={onClose}>
          ✕
        </button>

        {submitted ? (
          <div className={styles.formSuccess}>
            <span>🎉</span>
            <h3>Event submitted!</h3>
            <p>Our team will review and publish your event within 24 hours.</p>
          </div>
        ) : (
          <>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Post an Event</h2>
              <div className={styles.stepDots}>
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`${styles.stepDot} ${step >= s ? styles.stepDotActive : ""}`}
                  />
                ))}
              </div>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              {step === 1 && (
                <div className={styles.formStep}>
                  <label className={styles.label}>Event name *</label>
                  <input
                    className={styles.input}
                    placeholder="e.g. Sunday Football at Fleetwood Park"
                    required
                  />
                  <label className={styles.label}>Category</label>
                  <select className={styles.input}>
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <label className={styles.label}>Description *</label>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    placeholder="What should attendees know?"
                    required
                  />
                  <button
                    type="button"
                    className={styles.nextBtn}
                    onClick={() => setStep(2)}
                  >
                    Next →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className={styles.formStep}>
                  <label className={styles.label}>Date & Time *</label>
                  <input
                    className={styles.input}
                    type="datetime-local"
                    required
                  />
                  <label className={styles.label}>Location *</label>
                  <input
                    className={styles.input}
                    placeholder="Park, address, or area"
                    required
                  />
                  <label className={styles.label}>Max participants</label>
                  <input
                    className={styles.input}
                    type="number"
                    min="2"
                    max="50"
                    defaultValue={12}
                  />
                  <div className={styles.formRow}>
                    <button
                      type="button"
                      className={styles.backBtn}
                      onClick={() => setStep(1)}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      className={styles.nextBtn}
                      onClick={() => setStep(3)}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className={styles.formStep}>
                  <label className={styles.label}>Languages spoken</label>
                  <input
                    className={styles.input}
                    placeholder="e.g. English, Tagalog, Mandarin"
                  />
                  <label className={styles.label}>Your name *</label>
                  <input
                    className={styles.input}
                    placeholder="How you'll appear on the event"
                    required
                  />
                  <label className={styles.label}>Contact email *</label>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="Not shown publicly"
                    required
                  />
                  <div className={styles.formRow}>
                    <button
                      type="button"
                      className={styles.backBtn}
                      onClick={() => setStep(2)}
                    >
                      ← Back
                    </button>
                    <button type="submit" className={styles.submitBtn}>
                      Submit Event 🎉
                    </button>
                  </div>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
