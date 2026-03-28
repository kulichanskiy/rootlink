"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar/Navbar";
import ServiceCard from "../../components/ServiceCard/ServiceCard";
import FilterBar from "../../components/FilterBar/FilterBar";
import Modal from "../../components/Modal/Modal";
import CursorBlob from "../../components/CursorBlob/CursorBlob";
import { useAuth } from "../../context/AuthContext";
import { SERVICES, SERVICE_CATEGORIES } from "../../lib/data";
import {
  ApiError,
  createServiceRequest,
  fetchServices,
} from "../../lib/api";
import type { UiService } from "../../lib/api";
import styles from "../events/page.module.css";
import pageStyles from "./page.module.css";

type ModalState = {
  item: unknown;
  type: "event" | "service";
};

export default function ServicesPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [services, setServices] = useState<UiService[]>(SERVICES);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleFilterChange = (nextFilter: string) => {
    setFilter(nextFilter);
    setIsLoading(true);
    setLoadError(null);
  };

  const reloadServices = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    fetchServices(filter)
      .then((items) => setServices(items))
      .catch(() => {
        setLoadError("Could not load services from backend. Showing local data.");
        setServices(
          SERVICES.filter((sv) => filter === "All" || sv.category === filter),
        );
      })
      .finally(() => setIsLoading(false));
  }, [filter]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setLoadError(null);
    fetchServices(filter)
      .then((items) => {
        if (!active) return;
        setServices(items);
      })
      .catch(() => {
        if (!active) return;
        setLoadError("Could not load services from backend. Showing local data.");
        setServices(
          SERVICES.filter((sv) => filter === "All" || sv.category === filter),
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
    return services.filter((sv) => {
      const matchSearch =
        sv.title.toLowerCase().includes(search.toLowerCase()) ||
        sv.provider.toLowerCase().includes(search.toLowerCase()) ||
        sv.languages.join(" ").toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [services, search]);

  return (
    <>
      <CursorBlob />
      <Navbar />
      <main className={styles.page}>
        <div className={`${styles.pageHeader} ${pageStyles.servicesHeader}`}>
          <div className={styles.pageHeaderInner}>
            <p className={styles.eyebrow}>🤲 Offered by community members</p>
            <h1 className={styles.pageTitle}>Community Services</h1>
            <p className={styles.pageSub}>
              Discover trusted services in your language, offered by newcomers
              who&apos;ve been in your shoes.
            </p>
            <button
              type="button"
              className={styles.postBtn}
              onClick={() => setShowForm(true)}
            >
              + List Your Service
            </button>
          </div>
          <div className={pageStyles.servicesDecor} />
        </div>

        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search by service, name, or language…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <FilterBar
            categories={SERVICE_CATEGORIES}
            activeFilter={filter}
            onFilter={handleFilterChange}
          />
        </div>
        {loadError && <p className={styles.pageSub}>{loadError}</p>}

        <div className={styles.grid}>
          {!isLoading && filtered.length === 0 ? (
            <div className={styles.empty}>
              <span>🔎</span>
              <p>
                No services match your search. Try a different filter or
                language.
              </p>
            </div>
          ) : isLoading ? (
            <div className={styles.empty}>
              <span>⏳</span>
              <p>Loading services...</p>
            </div>
          ) : (
            filtered.map((sv, i) => (
              <div
                key={sv.id}
                className={styles.cardWrap}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <ServiceCard
                  service={sv}
                  onOpen={(item: unknown) => setModal({ item, type: "service" })}
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
        <PostServiceForm
          onClose={() => setShowForm(false)}
          onCreated={reloadServices}
        />
      )}
    </>
  );
}

function PostServiceForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { token } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState(SERVICE_CATEGORIES[0] ?? "Education");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("You need to sign in to list a service.");
      return;
    }
    if (!title.trim() || !location.trim()) {
      setError("Title and location are required.");
      return;
    }
    setPending(true);
    try {
      await createServiceRequest(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          type,
          tags: tags.trim() || undefined,
          location: location.trim(),
        },
        token,
      );
      onCreated();
      setSubmitted(true);
      setTimeout(onClose, 1600);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not create listing.",
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
            <h3>Service listed</h3>
            <p>Your offering is visible on RootLink.</p>
          </div>
        ) : (
          <>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>List a service</h2>
            </div>
            {!token && (
              <p className={styles.pageSub}>
                <Link href="/join">Sign in</Link> first — listings are tied to
                your account.
              </p>
            )}
            {error && <p className={styles.pageSub}>{error}</p>}
            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.label}>Title *</label>
              <input
                className={styles.input}
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Math tutoring"
              />
              <label className={styles.label}>Category</label>
              <select
                className={styles.input}
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.textarea}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What do you offer?"
              />
              <label className={styles.label}>Location *</label>
              <input
                className={styles.input}
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or neighbourhood"
              />
              <label className={styles.label}>Tags (optional)</label>
              <input
                className={styles.input}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. math, high school"
              />
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={pending || !token}
              >
                {pending ? "Publishing…" : "Publish listing"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
