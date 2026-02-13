package com.freelaconnect.api.service;

import com.freelaconnect.api.dto.FreelancerDtos.FreelancerDetails;
import com.freelaconnect.api.dto.FreelancerDtos.FreelancerProfileRequest;
import com.freelaconnect.api.dto.FreelancerDtos.FreelancerSummary;
import com.freelaconnect.api.dto.FreelancerDtos.ReviewDto;
import com.freelaconnect.api.model.Category;
import com.freelaconnect.api.model.Freelancer;
import com.freelaconnect.api.model.Project;
import com.freelaconnect.api.model.Review;
import com.freelaconnect.api.model.User;
import com.freelaconnect.api.repository.CategoryRepository;
import com.freelaconnect.api.repository.FreelancerRepository;
import com.freelaconnect.api.repository.ProjectRepository;
import com.freelaconnect.api.repository.ReviewRepository;
import com.freelaconnect.api.repository.UserRepository;
import com.freelaconnect.api.security.SecurityUtils;
import com.freelaconnect.api.security.UserPrincipal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class FreelancerService {
  private final FreelancerRepository freelancerRepository;
  private final UserRepository userRepository;
  private final CategoryRepository categoryRepository;
  private final ProjectRepository projectRepository;
  private final ReviewRepository reviewRepository;

  public FreelancerService(
      FreelancerRepository freelancerRepository,
      UserRepository userRepository,
      CategoryRepository categoryRepository,
      ProjectRepository projectRepository,
      ReviewRepository reviewRepository) {
    this.freelancerRepository = freelancerRepository;
    this.userRepository = userRepository;
    this.categoryRepository = categoryRepository;
    this.projectRepository = projectRepository;
    this.reviewRepository = reviewRepository;
  }

  public Freelancer getCurrentFreelancer() {
    UserPrincipal principal = SecurityUtils.currentUser();
    User user =
        userRepository
            .findById(principal.getId())
            .orElseThrow(() -> new IllegalStateException("User not found"));
    return freelancerRepository
        .findByUser(user)
        .orElseThrow(() -> new IllegalStateException("Freelancer profile not found"));
  }

  public FreelancerDetails getMyProfile() {
    Freelancer freelancer = getCurrentFreelancer();
    return mapDetails(freelancer);
  }

  public FreelancerDetails updateProfile(FreelancerProfileRequest request) {
    Freelancer freelancer = getCurrentFreelancer();
    if (request.getFullName() != null) {
      freelancer.setFullName(request.getFullName());
    }
    if (request.getBio() != null) {
      freelancer.setBio(request.getBio());
    }
    if (request.getSkills() != null) {
      freelancer.setSkills(request.getSkills());
    }
    if (request.getWhatsapp() != null) {
      freelancer.setWhatsapp(request.getWhatsapp());
    }
    if (request.getContactEmail() != null) {
      freelancer.setContactEmail(request.getContactEmail());
    }
    if (request.getProfilePhotoUrl() != null) {
      freelancer.setProfilePhotoUrl(request.getProfilePhotoUrl());
    }
    if (request.getCategoryNames() != null) {
      Set<Category> categories =
          request.getCategoryNames().stream()
              .filter(name -> name != null && !name.isBlank())
              .map(String::trim)
              .map(
                  name ->
                      categoryRepository
                          .findByName(name)
                          .orElseGet(
                              () -> {
                                Category created = new Category();
                                created.setName(name);
                                return categoryRepository.save(created);
                              }))
              .collect(Collectors.toSet());
      freelancer.setCategories(categories);
    }
    freelancerRepository.save(freelancer);
    return mapDetails(freelancer);
  }

  public List<Project> getMyProjects() {
    Freelancer freelancer = getCurrentFreelancer();
    return projectRepository.findByFreelancer(freelancer);
  }

  public List<ReviewDto> getMyReviews() {
    Freelancer freelancer = getCurrentFreelancer();
    return reviewRepository.findByFreelancer(freelancer).stream()
        .map(this::mapReview)
        .collect(Collectors.toList());
  }

  public List<FreelancerSummary> browseAll() {
    return freelancerRepository.findAll().stream()
        .map(this::mapSummary)
        .collect(Collectors.toList());
  }

  public FreelancerDetails getById(Long id) {
    Freelancer freelancer =
        freelancerRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Freelancer not found"));
    return mapDetails(freelancer);
  }

  public Double getAverageRating(Freelancer freelancer) {
    Double avg = reviewRepository.getAverageRating(freelancer);
    return avg == null ? 0.0 : avg;
  }

  private FreelancerSummary mapSummary(Freelancer freelancer) {
    FreelancerSummary summary = new FreelancerSummary();
    summary.setId(freelancer.getId());
    summary.setFullName(freelancer.getFullName());
    summary.setCategories(
        freelancer.getCategories().stream().map(Category::getName).collect(Collectors.toList()));
    summary.setSkills(freelancer.getSkills());
    summary.setProfilePhotoUrl(freelancer.getProfilePhotoUrl());
    summary.setAverageRating(getAverageRating(freelancer));
    return summary;
  }

  private FreelancerDetails mapDetails(Freelancer freelancer) {
    FreelancerDetails details = new FreelancerDetails();
    details.setId(freelancer.getId());
    details.setFullName(freelancer.getFullName());
    details.setBio(freelancer.getBio());
    details.setCategories(
        freelancer.getCategories().stream().map(Category::getName).collect(Collectors.toList()));
    details.setSkills(freelancer.getSkills());
    details.setProfilePhotoUrl(freelancer.getProfilePhotoUrl());
    details.setWhatsapp(freelancer.getWhatsapp());
    details.setContactEmail(freelancer.getContactEmail());
    details.setAverageRating(getAverageRating(freelancer));
    details.setReviews(
        reviewRepository.findByFreelancer(freelancer).stream()
            .map(this::mapReview)
            .collect(Collectors.toList()));
    return details;
  }

  private ReviewDto mapReview(Review review) {
    ReviewDto dto = new ReviewDto();
    dto.setId(review.getId());
    dto.setRating(review.getRating());
    dto.setComment(review.getComment());
    dto.setClientName(review.getClient().getFullName());
    return dto;
  }
}
