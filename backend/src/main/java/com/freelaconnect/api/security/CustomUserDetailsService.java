package com.freelaconnect.api.security;

import com.freelaconnect.api.model.User;
import com.freelaconnect.api.repository.UserRepository;
import java.util.Optional;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
  private final UserRepository userRepository;

  public CustomUserDetailsService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    Optional<User> user = userRepository.findByEmail(username);
    User found = user.orElseThrow(() -> new UsernameNotFoundException("User not found"));
    return new UserPrincipal(found.getId(), found.getEmail(), found.getPassword(), found.getRole());
  }
}
