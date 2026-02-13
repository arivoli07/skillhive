package com.freelaconnect.api.service;

import com.freelaconnect.api.dto.RequestDtos.CreateRequest;
import com.freelaconnect.api.dto.RequestDtos.RequestResponse;
import com.freelaconnect.api.model.Client;
import com.freelaconnect.api.model.Freelancer;
import com.freelaconnect.api.model.Project;
import com.freelaconnect.api.model.ProjectRequest;
import com.freelaconnect.api.model.ProjectStatus;
import com.freelaconnect.api.model.RequestStatus;
import com.freelaconnect.api.model.User;
import com.freelaconnect.api.repository.ClientRepository;
import com.freelaconnect.api.repository.FreelancerRepository;
import com.freelaconnect.api.repository.ProjectRepository;
import com.freelaconnect.api.repository.ProjectRequestRepository;
import com.freelaconnect.api.repository.UserRepository;
import com.freelaconnect.api.security.SecurityUtils;
import com.freelaconnect.api.security.UserPrincipal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class RequestService {
  private final ProjectRequestRepository requestRepository;
  private final ProjectRepository projectRepository;
  private final ClientRepository clientRepository;
  private final FreelancerRepository freelancerRepository;
  private final UserRepository userRepository;

  public RequestService(
      ProjectRequestRepository requestRepository,
      ProjectRepository projectRepository,
      ClientRepository clientRepository,
      FreelancerRepository freelancerRepository,
      UserRepository userRepository) {
    this.requestRepository = requestRepository;
    this.projectRepository = projectRepository;
    this.clientRepository = clientRepository;
    this.freelancerRepository = freelancerRepository;
    this.userRepository = userRepository;
  }

  public RequestResponse createRequest(CreateRequest request) {
    Client client = getCurrentClient();
    if (request.getFreelancerId() == null) {
      throw new IllegalArgumentException("Freelancer is required");
    }
    Freelancer freelancer =
        freelancerRepository
            .findById(request.getFreelancerId())
            .orElseThrow(() -> new IllegalArgumentException("Freelancer not found"));

    ProjectRequest entity = new ProjectRequest();
    entity.setClient(client);
    entity.setFreelancer(freelancer);
    entity.setType(request.getType());
    entity.setDescription(request.getDescription());
    entity.setDuration(request.getDuration());
    entity.setSalary(request.getSalary());
    entity.setStatus(RequestStatus.PENDING);
    entity.setCreatedAt(Instant.now());
    return map(requestRepository.save(entity));
  }

  public List<RequestResponse> getRequestsForFreelancer() {
    Freelancer freelancer = getCurrentFreelancer();
    return requestRepository.findByFreelancer(freelancer).stream()
        .filter(req -> req.getStatus() == RequestStatus.PENDING)
        .map(this::map)
        .collect(Collectors.toList());
  }

  public RequestResponse acceptRequest(Long requestId) {
    Freelancer freelancer = getCurrentFreelancer();
    ProjectRequest request =
        requestRepository
            .findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Request not found"));
    if (!request.getFreelancer().getId().equals(freelancer.getId())) {
      throw new IllegalArgumentException("Not authorized for this request");
    }
    if (request.getStatus() != RequestStatus.PENDING) {
      throw new IllegalArgumentException("Request already processed");
    }
    request.setStatus(RequestStatus.ACCEPTED);
    requestRepository.save(request);

    Project project = new Project();
    project.setClient(request.getClient());
    project.setFreelancer(request.getFreelancer());
    project.setTitle(request.getType() == null ? "Client request" : request.getType());
    project.setServiceName(request.getType());
    project.setDescription(request.getDescription());
    project.setDuration(request.getDuration());
    project.setSalary(parseSalary(request.getSalary()));
    project.setStatus(ProjectStatus.IN_PROGRESS);
    project.setCreatedAt(Instant.now());
    project.setUpdatedAt(Instant.now());
    projectRepository.save(project);

    return map(request);
  }

  public RequestResponse declineRequest(Long requestId) {
    Freelancer freelancer = getCurrentFreelancer();
    ProjectRequest request =
        requestRepository
            .findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Request not found"));
    if (!request.getFreelancer().getId().equals(freelancer.getId())) {
      throw new IllegalArgumentException("Not authorized for this request");
    }
    if (request.getStatus() != RequestStatus.PENDING) {
      throw new IllegalArgumentException("Request already processed");
    }
    request.setStatus(RequestStatus.DECLINED);
    return map(requestRepository.save(request));
  }

  private Client getCurrentClient() {
    UserPrincipal principal = SecurityUtils.currentUser();
    User user =
        userRepository
            .findById(principal.getId())
            .orElseThrow(() -> new IllegalStateException("User not found"));
    return clientRepository
        .findByUser(user)
        .orElseThrow(() -> new IllegalStateException("Client profile not found"));
  }

  private Freelancer getCurrentFreelancer() {
    UserPrincipal principal = SecurityUtils.currentUser();
    User user =
        userRepository
            .findById(principal.getId())
            .orElseThrow(() -> new IllegalStateException("User not found"));
    return freelancerRepository
        .findByUser(user)
        .orElseThrow(() -> new IllegalStateException("Freelancer profile not found"));
  }

  private RequestResponse map(ProjectRequest request) {
    RequestResponse response = new RequestResponse();
    response.setId(request.getId());
    response.setFreelancerId(request.getFreelancer().getId());
    response.setFreelancerName(request.getFreelancer().getFullName());
    response.setClientName(request.getClient().getFullName());
    response.setType(request.getType());
    response.setDescription(request.getDescription());
    response.setDuration(request.getDuration());
    response.setSalary(request.getSalary());
    response.setStatus(request.getStatus().name());
    return response;
  }

  private Double parseSalary(String salary) {
    if (salary == null || salary.isBlank()) {
      return null;
    }
    try {
      String normalized = salary.replaceAll("[^0-9.]", "");
      return normalized.isBlank() ? null : Double.parseDouble(normalized);
    } catch (NumberFormatException ex) {
      return null;
    }
  }
}
