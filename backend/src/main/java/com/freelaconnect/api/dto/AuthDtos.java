package com.freelaconnect.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class AuthDtos {

  @Data
  public static class RegisterClientRequest {
    @NotBlank private String fullName;
    private String company;
    private String profilePhotoUrl;
    @Email @NotBlank private String email;
    @NotBlank private String password;
  }

  @Data
  public static class RegisterFreelancerRequest {
    @NotBlank private String fullName;
    private String bio;
    private String skills;
    private java.util.List<String> categoryNames;
    private String whatsapp;
    private String contactEmail;
    private String profilePhotoUrl;
    @Email @NotBlank private String email;
    @NotBlank private String password;
  }

  @Data
  public static class LoginRequest {
    @Email @NotBlank private String email;
    @NotBlank private String password;
  }

  @Data
  public static class AuthResponse {
    private String token;
    private String role;
    private Long userId;
  }
}
