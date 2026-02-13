package com.freelaconnect.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class RequestDtos {

  @Data
  public static class CreateRequest {
    private Long freelancerId;
    @NotBlank private String type;
    private String description;
    private String duration;
    private String salary;
  }

  @Data
  public static class RequestResponse {
    private Long id;
    private Long freelancerId;
    private String freelancerName;
    private String clientName;
    private String type;
    private String description;
    private String duration;
    private String salary;
    private String status;
  }
}
