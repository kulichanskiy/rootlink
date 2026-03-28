"use client";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import ServiceCard from "../../components/ServiceCard/ServiceCard";
import FilterBar from "../../components/FilterBar/FilterBar";
import Modal from "../../components/Modal/Modal";
import CursorBlob from "../../components/CursorBlob/CursorBlob";
import { SERVICES, SERVICE_CATEGORIES } from "../../lib/data";
import { fetchServices } from "../../lib/api";
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
  const [services, setServices] = useState<UiService[]>(SERVICES);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleFilterChange = (nextFilter: string) => {
    setFilter(nextFilter);
    setIsLoading(true);
    setLoadError(null);
  };

  useEffect(() => {
    let active = true;

    fetchServices(filter)
      .then((items) => {
        if (!active) return;
        setServices(items.length > 0 ? items : []);
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
            <button className={styles.postBtn}>+ List Your Service</button>
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
    </>
  );
}
