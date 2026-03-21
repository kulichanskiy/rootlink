package com.rootlink.exception;

// ── 409 ──────────────────────────────────────────────────────
public class ConflictException extends RuntimeException {
    public ConflictException(String message) { super(message); }
}
