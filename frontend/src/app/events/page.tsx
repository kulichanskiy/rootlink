"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar/Navbar";
import EventCard from "../../components/EventCard/EventCard";
import FilterBar from "../../components/FilterBar/FilterBar";
import Modal from "../../components/Modal/Modal";
import CursorBlob from "../../components/CursorBlob/CursorBlob";
import { useAuth } from "../../context/AuthContext";
import { EVENTS, EVENT_CATEGORIES } from "../../lib/data";
import {
  ApiError,
  createEventRequest,
  fetchEvents,
} from "../../lib/api";
import type { UiEvent } from "../../lib/api";
import styles from "./page.module.css";

type ModalState = {
  item: unknown;
  type: "event" | "service";
};

type PostEventFormProps = {
  onClose: () => void;
  onCreated: () => void;
};

function toEventDateTime(local: string): string {
  if (!local) return "";
  return local.length === 16 ? `${local}:00` : local;
}

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

  const reloadEvents = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    fetchEvents(filter)
      .then((items) => setEvents(items))
      .catch(() => {
        setLoadError("Could not load events from backend. Showing local data.");
        setEvents(
          EVENTS.filter((ev) => filter === "All" || ev.category === filter),
        );
      })
      .finally(() => setIsLoading(false));
  }, [filter]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setLoadError(null);
    fetchEvents(filter)
      .then((items) => {
        if (!active) return;
        setEvents(items);
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

      {showForm && (
        <PostEventForm
          onClose={() => setShowForm(false)}
          onCreated={reloadEvents}
        />
      )}
    </>
  );
}

function PostEventForm({ onClose, onCreated }: PostEventFormProps) {
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(EVENT_CATEGORIES[0] ?? "Sports");
  const [description, setDescription] = useState("");
  const [eventDatetime, setEventDatetime] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState(12);
  const [tags, setTags] = useState("");

  const goStep2 = () => {
    setError(null);
    if (!title.trim() || !description.trim()) {
      setError("Please add a title and description.");
      return;
    }
    setStep(2);
  };

  const goStep3 = () => {
    setError(null);
    if (!eventDatetime.trim() || !location.trim()) {
      setError("Please set date, time, and location.");
      return;
    }
    const t = new Date(eventDatetime);
    if (Number.isNaN(t.getTime()) || t.getTime() <= Date.now()) {
      setError("Choose a future date and time.");
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("You need to sign in to post an event.");
      return;
    }
    setPending(true);
    try {
      await createEventRequest(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          tags: tags.trim() || undefined,
          eventDatetime: toEventDateTime(eventDatetime),
          location: location.trim(),
          capacity: Math.max(1, Math.min(500, Number(capacity) || 1)),
        },
        token,
      );
      onCreated();
      setSubmitted(true);
      setTimeout(onClose, 1800);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not create event.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.formOverlay} onClick={onClose}>
      <div className={styles.formModal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.formClose} onClick={onClose}>
          ✕
        </button>

        {submitted ? (
          <div className={styles.formSuccess}>
            <span>🎉</span>
            <h3>Event published</h3>
            <p>Your event is live on RootLink.</p>
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

            {!token && (
              <p className={styles.pageSub}>
                <Link href="/join">Sign in</Link> to post — your account is the
                organizer.
              </p>
            )}

            {error && <p className={styles.pageSub}>{error}</p>}

            <form className={styles.form} onSubmit={handleSubmit}>
              {step === 1 && (
                <div className={styles.formStep}>
                  <label className={styles.label}>Event name *</label>
                  <input
                    className={styles.input}
                    placeholder="e.g. Sunday Football at Fleetwood Park"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <label className={styles.label}>Category</label>
                  <select
                    className={styles.input}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <label className={styles.label}>Description *</label>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    placeholder="What should attendees know?"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.nextBtn}
                    onClick={goStep2}
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
                    value={eventDatetime}
                    onChange={(e) => setEventDatetime(e.target.value)}
                  />
                  <label className={styles.label}>Location *</label>
                  <input
                    className={styles.input}
                    placeholder="Park, address, or area"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <label className={styles.label}>Max participants</label>
                  <input
                    className={styles.input}
                    type="number"
                    min={1}
                    max={500}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
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
                      onClick={goStep3}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className={styles.formStep}>
                  <label className={styles.label}>
                    Languages / tags (optional)
                  </label>
                  <input
                    className={styles.input}
                    placeholder="e.g. English, outdoor, beginners"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                  <div className={styles.formRow}>
                    <button
                      type="button"
                      className={styles.backBtn}
                      onClick={() => setStep(2)}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={pending || !token}
                    >
                      {pending ? "Publishing…" : "Publish event"}
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
