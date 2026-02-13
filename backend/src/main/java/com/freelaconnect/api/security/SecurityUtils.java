package com.freelaconnect.api.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {
  private SecurityUtils() {}

  public static UserPrincipal currentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal)) {
      throw new IllegalStateException("No authenticated user");
    }
    return (UserPrincipal) authentication.getPrincipal();
  }
}
