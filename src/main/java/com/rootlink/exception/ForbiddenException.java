package com.rootlink.exception;

// ── 403 ──────────────────────────────────────────────────────
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) { super(message); }
}
