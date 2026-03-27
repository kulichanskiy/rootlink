"use client";
import { useState, useMemo } from "react";
import Navbar from "../../components/Navbar/Navbar";
import ServiceCard from "../../components/ServiceCard/ServiceCard";
import FilterBar from "../../components/FilterBar/FilterBar";
import Modal from "../../components/Modal/Modal";
import CursorBlob from "../../components/CursorBlob/CursorBlob";
import { SERVICES, SERVICE_CATEGORIES } from "../../lib/data";
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

  const filtered = useMemo(() => {
    return SERVICES.filter((sv) => {
      const matchCat = filter === "All" || sv.category === filter;
      const matchSearch =
        sv.title.toLowerCase().includes(search.toLowerCase()) ||
        sv.provider.toLowerCase().includes(search.toLowerCase()) ||
        sv.languages.join(" ").toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [filter, search]);

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
            onFilter={setFilter}
          />
        </div>

        <div className={styles.grid}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <span>🔎</span>
              <p>
                No services match your search. Try a different filter or
                language.
              </p>
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
