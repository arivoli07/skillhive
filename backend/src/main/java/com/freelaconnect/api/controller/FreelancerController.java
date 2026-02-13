package com.freelaconnect.api.controller;

import com.freelaconnect.api.dto.FreelancerDtos.FreelancerDetails;
import com.freelaconnect.api.dto.FreelancerDtos.FreelancerProfileRequest;
import com.freelaconnect.api.dto.FreelancerDtos.FreelancerSummary;
import com.freelaconnect.api.dto.FreelancerDtos.ReviewDto;
import com.freelaconnect.api.dto.RequestDtos.RequestResponse;
import com.freelaconnect.api.model.Project;
import com.freelaconnect.api.service.FreelancerService;
import com.freelaconnect.api.service.RequestService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/freelancers")
public class FreelancerController {
  private final FreelancerService freelancerService;
  private final RequestService requestService;

  public FreelancerController(FreelancerService freelancerService, RequestService requestService) {
    this.freelancerService = freelancerService;
    this.requestService = requestService;
  }

  @GetMapping
  public List<FreelancerSummary> browseFreelancers() {
    return freelancerService.browseAll();
  }

  @GetMapping("/{id}")
  public FreelancerDetails getFreelancer(@PathVariable Long id) {
    return freelancerService.getById(id);
  }

  @PreAuthorize("hasRole('FREELANCER')")
  @GetMapping("/me")
  public FreelancerDetails getMyProfile() {
    return freelancerService.getMyProfile();
  }

  @PreAuthorize("hasRole('FREELANCER')")
  @PutMapping("/me")
  public FreelancerDetails updateProfile(@RequestBody FreelancerProfileRequest request) {
    return freelancerService.updateProfile(request);
  }

  @PreAuthorize("hasRole('FREELANCER')")
  @GetMapping("/me/projects")
  public List<Project> getMyProjects() {
    return freelancerService.getMyProjects();
  }

  @PreAuthorize("hasRole('FREELANCER')")
  @GetMapping("/me/reviews")
  public List<ReviewDto> getMyReviews() {
    return freelancerService.getMyReviews();
  }

  @PreAuthorize("hasRole('FREELANCER')")
  @GetMapping("/me/requests")
  public List<RequestResponse> getMyRequests() {
    return requestService.getRequestsForFreelancer();
  }

  @PreAuthorize("hasRole('FREELANCER')")
  @PostMapping("/me/requests/{requestId}/accept")
  public ResponseEntity<RequestResponse> acceptRequest(
      @PathVariable("requestId") Long requestId) {
    return ResponseEntity.ok(requestService.acceptRequest(requestId));
  }

  @PreAuthorize("hasRole('FREELANCER')")
  @PostMapping("/me/requests/{requestId}/decline")
  public ResponseEntity<RequestResponse> declineRequest(
      @PathVariable("requestId") Long requestId) {
    return ResponseEntity.ok(requestService.declineRequest(requestId));
  }
}
