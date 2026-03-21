package com.rootlink.security;

/**
 * Lightweight principal stored in the Spring SecurityContext after JWT validation.
 * Controllers retrieve the authenticated user's id via:
 *
 *   RootlinkUserPrincipal principal =
 *       (RootlinkUserPrincipal) SecurityContextHolder.getContext()
 *                                                   .getAuthentication()
 *                                                   .getPrincipal();
 *   Long userId = principal.getUserId();
 */
public class RootlinkUserPrincipal {

    private final Long   userId;
    private final String email;

    public RootlinkUserPrincipal(Long userId, String email) {
        this.userId = userId;
        this.email  = email;
    }

    public Long   getUserId() { return userId; }
    public String getEmail()  { return email;  }

    @Override
    public String toString() {
        return "RootlinkUserPrincipal{userId=" + userId + ", email='" + email + "'}";
    }
}
