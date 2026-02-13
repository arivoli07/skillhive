package com.freelaconnect.api.dto;

import java.util.List;
import lombok.Data;

public class FreelancerDtos {

  @Data
  public static class FreelancerProfileRequest {
    private String fullName;
    private String bio;
    private String skills;
    private java.util.List<String> categoryNames;
    private String whatsapp;
    private String contactEmail;
    private String profilePhotoUrl;
  }

  @Data
  public static class FreelancerSummary {
    private Long id;
    private String fullName;
    private java.util.List<String> categories;
    private String skills;
    private String profilePhotoUrl;
    private Double averageRating;
  }

  @Data
  public static class FreelancerDetails {
    private Long id;
    private String fullName;
    private String bio;
    private java.util.List<String> categories;
    private String skills;
    private String profilePhotoUrl;
    private String whatsapp;
    private String contactEmail;
    private Double averageRating;
    private List<ReviewDto> reviews;
  }

  @Data
  public static class ReviewDto {
    private Long id;
    private Integer rating;
    private String comment;
    private String clientName;
  }
}
