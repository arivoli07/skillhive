package com.freelaconnect.api.service;

import com.freelaconnect.api.dto.AuthDtos.AuthResponse;
import com.freelaconnect.api.dto.AuthDtos.LoginRequest;
import com.freelaconnect.api.dto.AuthDtos.RegisterClientRequest;
import com.freelaconnect.api.dto.AuthDtos.RegisterFreelancerRequest;
import com.freelaconnect.api.model.Category;
import com.freelaconnect.api.model.Client;
import com.freelaconnect.api.model.Freelancer;
import com.freelaconnect.api.model.Role;
import com.freelaconnect.api.model.User;
import com.freelaconnect.api.repository.CategoryRepository;
import com.freelaconnect.api.repository.ClientRepository;
import com.freelaconnect.api.repository.FreelancerRepository;
import com.freelaconnect.api.repository.UserRepository;
import com.freelaconnect.api.security.JwtTokenProvider;
import com.freelaconnect.api.security.UserPrincipal;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final ClientRepository clientRepository;
  private final FreelancerRepository freelancerRepository;
  private final CategoryRepository categoryRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JwtTokenProvider tokenProvider;

  public AuthService(
      UserRepository userRepository,
      ClientRepository clientRepository,
      FreelancerRepository freelancerRepository,
      CategoryRepository categoryRepository,
      PasswordEncoder passwordEncoder,
      AuthenticationManager authenticationManager,
      JwtTokenProvider tokenProvider) {
    this.userRepository = userRepository;
    this.clientRepository = clientRepository;
    this.freelancerRepository = freelancerRepository;
    this.categoryRepository = categoryRepository;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
    this.tokenProvider = tokenProvider;
  }

  @Transactional
  public AuthResponse registerClient(RegisterClientRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new IllegalArgumentException("Email already registered.");
    }
    User user = new User();
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setRole(Role.CLIENT);
    userRepository.save(user);

    Client client = new Client();
    client.setUser(user);
    client.setFullName(request.getFullName());
    client.setCompany(request.getCompany());
    client.setProfilePhotoUrl(request.getProfilePhotoUrl());
    clientRepository.save(client);

    return buildAuthResponse(user);
  }

  @Transactional
  public AuthResponse registerFreelancer(RegisterFreelancerRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new IllegalArgumentException("Email already registered.");
    }
    User user = new User();
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setRole(Role.FREELANCER);
    userRepository.save(user);

    Freelancer freelancer = new Freelancer();
    freelancer.setUser(user);
    freelancer.setFullName(request.getFullName());
    freelancer.setBio(request.getBio());
    freelancer.setSkills(request.getSkills());
    freelancer.setWhatsapp(request.getWhatsapp());
    freelancer.setContactEmail(request.getContactEmail());
    freelancer.setProfilePhotoUrl(request.getProfilePhotoUrl());
    if (request.getCategoryNames() != null) {
      java.util.Set<Category> categories =
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
              .collect(java.util.stream.Collectors.toSet());
      freelancer.setCategories(categories);
    }
    freelancerRepository.save(freelancer);

    return buildAuthResponse(user);
  }

  public AuthResponse login(LoginRequest request) {
    Authentication authentication =
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
    UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
    String token = tokenProvider.generateToken(principal);
    AuthResponse response = new AuthResponse();
    response.setToken(token);
    response.setRole(principal.getRole().name());
    response.setUserId(principal.getId());
    return response;
  }

  private AuthResponse buildAuthResponse(User user) {
    UserPrincipal principal = new UserPrincipal(user.getId(), user.getEmail(), user.getPassword(), user.getRole());
    String token = tokenProvider.generateToken(principal);
    AuthResponse response = new AuthResponse();
    response.setToken(token);
    response.setRole(user.getRole().name());
    response.setUserId(user.getId());
    return response;
  }
}
