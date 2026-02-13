package com.freelaconnect.api.service;

import com.freelaconnect.api.dto.ClientDtos.ClientProfileRequest;
import com.freelaconnect.api.dto.ClientDtos.ClientProfileResponse;
import com.freelaconnect.api.dto.ClientDtos.HireProjectRequest;
import com.freelaconnect.api.dto.ClientDtos.ReviewRequest;
import com.freelaconnect.api.dto.FreelancerDtos.FreelancerSummary;
import com.freelaconnect.api.model.Client;
import com.freelaconnect.api.model.Freelancer;
import com.freelaconnect.api.model.Project;
import com.freelaconnect.api.model.ProjectStatus;
import com.freelaconnect.api.model.Review;
import com.freelaconnect.api.model.User;
import com.freelaconnect.api.repository.ClientRepository;
import com.freelaconnect.api.repository.FreelancerRepository;
import com.freelaconnect.api.repository.ProjectRepository;
import com.freelaconnect.api.repository.ReviewRepository;
import com.freelaconnect.api.repository.UserRepository;
import com.freelaconnect.api.security.SecurityUtils;
import com.freelaconnect.api.security.UserPrincipal;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ClientService {
  private final ClientRepository clientRepository;
  private final UserRepository userRepository;
  private final FreelancerRepository freelancerRepository;
  private final ProjectRepository projectRepository;
  private final ReviewRepository reviewRepository;
  private final FreelancerService freelancerService;

  public ClientService(
      ClientRepository clientRepository,
      UserRepository userRepository,
      FreelancerRepository freelancerRepository,
      ProjectRepository projectRepository,
      ReviewRepository reviewRepository,
      FreelancerService freelancerService) {
    this.clientRepository = clientRepository;
    this.userRepository = userRepository;
    this.freelancerRepository = freelancerRepository;
    this.projectRepository = projectRepository;
    this.reviewRepository = reviewRepository;
    this.freelancerService = freelancerService;
  }

  public Client getCurrentClient() {
    UserPrincipal principal = SecurityUtils.currentUser();
    User user =
        userRepository
            .findById(principal.getId())
            .orElseThrow(() -> new IllegalStateException("User not found"));
    return clientRepository
        .findByUser(user)
        .orElseThrow(() -> new IllegalStateException("Client profile not found"));
  }

  public List<FreelancerSummary> browseFreelancers(
      String category, String minRating, String skill, String search) {
    String safeCategory = normalize(category);
    String safeRating = normalize(minRating);
    String safeSkill = normalize(skill);
    String safeSearch = normalize(search);

    List<FreelancerSummary> all = freelancerService.browseAll();
    return all.stream()
        .filter(
            summary ->
                safeCategory == null
                    || (summary.getCategories() != null
                        && summary.getCategories().stream()
                            .anyMatch(cat -> cat.equalsIgnoreCase(safeCategory))))
        .filter(
            summary ->
                safeRating == null
                    || summary.getAverageRating() >= Double.parseDouble(safeRating))
        .filter(
            summary ->
                safeSkill == null
                    || (summary.getSkills() != null
                        && summary.getSkills()
                            .toLowerCase(Locale.ROOT)
                            .contains(safeSkill.toLowerCase(Locale.ROOT))))
        .filter(
            summary ->
                safeSearch == null
                    || summary.getFullName()
                        .toLowerCase(Locale.ROOT)
                        .contains(safeSearch.toLowerCase(Locale.ROOT))
                    || (summary.getSkills() != null
                        && summary.getSkills()
                            .toLowerCase(Locale.ROOT)
                            .contains(safeSearch.toLowerCase(Locale.ROOT))))
        .collect(Collectors.toList());
  }

  private String normalize(String value) {
    if (value == null) {
      return null;
    }
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }

  public Project hireFreelancer(HireProjectRequest request) {
    Client client = getCurrentClient();
    Freelancer freelancer =
        freelancerRepository
            .findById(request.getFreelancerId())
            .orElseThrow(() -> new IllegalArgumentException("Freelancer not found"));
    Project project = new Project();
    project.setClient(client);
    project.setFreelancer(freelancer);
    project.setTitle(request.getTitle());
    project.setDescription(request.getDescription());
    project.setServiceName(request.getServiceName());
    project.setDuration(request.getDuration());
    project.setDeadline(request.getDeadline());
    project.setSalary(request.getSalary());
    project.setStatus(ProjectStatus.PENDING);
    project.setCreatedAt(Instant.now());
    project.setUpdatedAt(Instant.now());
    return projectRepository.save(project);
  }

  public Review completeProject(Long projectId, Integer rating, String comment) {
    Client client = getCurrentClient();
    Project project =
        projectRepository
            .findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("Project not found"));
    if (!project.getClient().getId().equals(client.getId())) {
      throw new IllegalArgumentException("Not authorized for this project");
    }
    project.setStatus(ProjectStatus.COMPLETED);
    project.setUpdatedAt(Instant.now());
    projectRepository.save(project);

    if (rating == null && (comment == null || comment.isBlank())) {
      return null;
    }
    if (rating == null) {
      throw new IllegalArgumentException("Rating is required");
    }
    if (reviewRepository.findByProject(project).isPresent()) {
      throw new IllegalArgumentException("Review already submitted for this project");
    }
    Review review = new Review();
    review.setProject(project);
    review.setClient(client);
    review.setFreelancer(project.getFreelancer());
    review.setRating(rating);
    review.setComment(comment);
    review.setCreatedAt(Instant.now());
    return reviewRepository.save(review);
  }

  public Review addReview(ReviewRequest request) {
    Client client = getCurrentClient();
    Project project =
        projectRepository
            .findById(request.getProjectId())
            .orElseThrow(() -> new IllegalArgumentException("Project not found"));
    if (!project.getClient().getId().equals(client.getId())) {
      throw new IllegalArgumentException("Not authorized for this project");
    }
    if (project.getStatus() != ProjectStatus.COMPLETED) {
      throw new IllegalArgumentException("Project must be completed before review");
    }
    if (reviewRepository.findByProject(project).isPresent()) {
      throw new IllegalArgumentException("Review already submitted for this project");
    }
    Review review = new Review();
    review.setProject(project);
    review.setClient(client);
    review.setFreelancer(project.getFreelancer());
    review.setRating(request.getRating());
    review.setComment(request.getComment());
    review.setCreatedAt(Instant.now());
    return reviewRepository.save(review);
  }

  public List<Project> getMyProjects() {
    Client client = getCurrentClient();
    return projectRepository.findByClient(client);
  }

  public ClientProfileResponse getMyProfile() {
    Client client = getCurrentClient();
    return mapProfile(client);
  }

  public ClientProfileResponse updateMyProfile(ClientProfileRequest request) {
    Client client = getCurrentClient();
    if (request.getFullName() != null) {
      client.setFullName(request.getFullName());
    }
    if (request.getCompany() != null) {
      client.setCompany(request.getCompany());
    }
    if (request.getProfilePhotoUrl() != null) {
      client.setProfilePhotoUrl(request.getProfilePhotoUrl());
    }
    clientRepository.save(client);
    return mapProfile(client);
  }

  private ClientProfileResponse mapProfile(Client client) {
    ClientProfileResponse response = new ClientProfileResponse();
    response.setId(client.getId());
    response.setFullName(client.getFullName());
    response.setCompany(client.getCompany());
    response.setProfilePhotoUrl(client.getProfilePhotoUrl());
    return response;
  }
}
