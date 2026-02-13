package com.freelaconnect.api.controller;

import com.freelaconnect.api.dto.ClientDtos.ClientProfileRequest;
import com.freelaconnect.api.dto.ClientDtos.ClientProfileResponse;
import com.freelaconnect.api.dto.ClientDtos.CompleteProjectRequest;
import com.freelaconnect.api.dto.ClientDtos.HireProjectRequest;
import com.freelaconnect.api.dto.ClientDtos.ReviewRequest;
import com.freelaconnect.api.dto.RequestDtos.CreateRequest;
import com.freelaconnect.api.dto.RequestDtos.RequestResponse;
import com.freelaconnect.api.dto.FreelancerDtos.FreelancerSummary;
import com.freelaconnect.api.model.Project;
import com.freelaconnect.api.model.Review;
import com.freelaconnect.api.repository.ProjectRepository;
import com.freelaconnect.api.service.ClientService;
import com.freelaconnect.api.service.RequestService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clients")
public class ClientController {
  private final ClientService clientService;
  private final ProjectRepository projectRepository;
  private final RequestService requestService;

  public ClientController(
      ClientService clientService,
      ProjectRepository projectRepository,
      RequestService requestService) {
    this.clientService = clientService;
    this.projectRepository = projectRepository;
    this.requestService = requestService;
  }

  @GetMapping("/freelancers")
  public List<FreelancerSummary> browseFreelancers(
      @RequestParam(required = false) String category,
      @RequestParam(required = false) String rating,
      @RequestParam(required = false) String skill,
      @RequestParam(required = false) String search) {
    return clientService.browseFreelancers(category, rating, skill, search);
  }

  @PreAuthorize("hasRole('CLIENT')")
  @PostMapping("/hire")
  public ResponseEntity<Project> hireFreelancer(@RequestBody HireProjectRequest request) {
    return ResponseEntity.ok(clientService.hireFreelancer(request));
  }

  @PreAuthorize("hasRole('CLIENT')")
  @PostMapping("/me/requests")
  public ResponseEntity<RequestResponse> createRequest(@RequestBody CreateRequest request) {
    return ResponseEntity.ok(requestService.createRequest(request));
  }

  @PreAuthorize("hasRole('CLIENT')")
  @PostMapping("/reviews")
  public ResponseEntity<Review> addReview(@RequestBody ReviewRequest request) {
    return ResponseEntity.ok(clientService.addReview(request));
  }

  @PreAuthorize("hasRole('CLIENT')")
  @GetMapping("/me/projects")
  public List<Project> getMyProjects() {
    return clientService.getMyProjects();
  }

  @PreAuthorize("hasRole('CLIENT')")
  @PostMapping("/me/projects/{projectId}/complete")
  public ResponseEntity<Review> completeProject(
      @PathVariable("projectId") Long projectId, @RequestBody CompleteProjectRequest request) {
    return ResponseEntity.ok(
        clientService.completeProject(projectId, request.getRating(), request.getComment()));
  }

  @PreAuthorize("hasRole('CLIENT')")
  @GetMapping("/me")
  public ClientProfileResponse getMyProfile() {
    return clientService.getMyProfile();
  }

  @PreAuthorize("hasRole('CLIENT')")
  @PutMapping("/me")
  public ClientProfileResponse updateMyProfile(@RequestBody ClientProfileRequest request) {
    return clientService.updateMyProfile(request);
  }
}
