package com.freelaconnect.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class ClientDtos {

  @Data
  public static class HireProjectRequest {
    @NotBlank private String title;
    private String description;
    private String serviceName;
    private String duration;
    private String deadline;
    private Double salary;
    private Long freelancerId;
  }

  @Data
  public static class ReviewRequest {
    private Long projectId;
    @Min(1)
    @Max(5)
    private Integer rating;
    private String comment;
  }

  @Data
  public static class CompleteProjectRequest {
    @Min(1)
    @Max(5)
    private Integer rating;
    private String comment;
  }

  @Data
  public static class ClientProfileRequest {
    private String fullName;
    private String company;
    private String profilePhotoUrl;
  }

  @Data
  public static class ClientProfileResponse {
    private Long id;
    private String fullName;
    private String company;
    private String profilePhotoUrl;
  }
}
