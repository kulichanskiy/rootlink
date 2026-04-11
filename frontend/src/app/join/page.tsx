"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "@/components/Navbar/Navbar";
import CursorBlob from "@/components/CursorBlob/CursorBlob";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import styles from "./page.module.css";

type Tab = "login" | "register";

export default function JoinPage() {
  const router = useRouter();
  const { login, register, user } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferences, setPreferences] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [registered, setRegistered] = useState(false);

  if (user) {
    return (
      <>
        <CursorBlob />
        <Navbar />
        <div className={styles.page}>
          <div className={styles.inner}>
            <p className={styles.eyebrow}>Signed in</p>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.sub}>
              You are logged in as <strong>{user.email}</strong>.
            </p>
            <Link href="/events" className={styles.submit} style={{ display: "inline-block", textAlign: "center", textDecoration: "none" }}>
              Browse events
            </Link>
          </div>
        </div>
      </>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email, password);
      router.push("/events");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign in.");
    } finally {
      setPending(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await register({
        email,
        password,
        preferences: preferences.trim() || undefined,
        location: location.trim() || undefined,
      });
      setRegistered(true);
      setTab("login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create account.");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <CursorBlob />
      <Navbar />
      <div className={styles.page}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>RootLink</p>
          <h1 className={styles.title}>Join the community</h1>
          <p className={styles.sub}>
            Create an account or sign in to post events and list services.
          </p>

          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${tab === "login" ? styles.tabActive : ""}`}
              onClick={() => {
                setTab("login");
                setError(null);
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`${styles.tab} ${tab === "register" ? styles.tabActive : ""}`}
              onClick={() => {
                setTab("register");
                setError(null);
              }}
            >
              Register
            </button>
          </div>

          {registered && tab === "login" && (
            <p className={styles.success} style={{ marginBottom: 16 }}>
              <span>✓</span>
              Account created. Sign in with your email and password.
            </p>
          )}

          {error && <div className={styles.error}>{error}</div>}

          {tab === "login" ? (
            <form className={styles.form} onSubmit={handleLogin}>
              <label className={styles.label} htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                className={styles.input}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className={styles.label} htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                className={styles.input}
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className={styles.submit} type="submit" disabled={pending}>
                {pending ? "Signing in…" : "Sign in"}
              </button>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleRegister}>
              <label className={styles.label} htmlFor="reg-email">
                Email
              </label>
              <input
                id="reg-email"
                className={styles.input}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className={styles.label} htmlFor="reg-password">
                Password (min 6 characters)
              </label>
              <input
                id="reg-password"
                className={styles.input}
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label className={styles.label} htmlFor="reg-pref">
                Languages / preferences (optional)
              </label>
              <input
                id="reg-pref"
                className={styles.input}
                placeholder="e.g. English, Ukrainian"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
              />
              <label className={styles.label} htmlFor="reg-loc">
                City / area (optional)
              </label>
              <input
                id="reg-loc"
                className={styles.input}
                placeholder="e.g. Surrey"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <button className={styles.submit} type="submit" disabled={pending}>
                {pending ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}

          <Link href="/" className={styles.back}>
            ← Back to home
          </Link>
        </div>
      </div>
    </>
  );
}
