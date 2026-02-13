package com.freelaconnect.api.controller;

import com.freelaconnect.api.dto.AuthDtos.AuthResponse;
import com.freelaconnect.api.dto.AuthDtos.LoginRequest;
import com.freelaconnect.api.dto.AuthDtos.RegisterClientRequest;
import com.freelaconnect.api.dto.AuthDtos.RegisterFreelancerRequest;
import com.freelaconnect.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register/client")
  public ResponseEntity<AuthResponse> registerClient(
      @Valid @RequestBody RegisterClientRequest request) {
    return ResponseEntity.ok(authService.registerClient(request));
  }

  @PostMapping("/register/freelancer")
  public ResponseEntity<AuthResponse> registerFreelancer(
      @Valid @RequestBody RegisterFreelancerRequest request) {
    return ResponseEntity.ok(authService.registerFreelancer(request));
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.ok(authService.login(request));
  }
}
