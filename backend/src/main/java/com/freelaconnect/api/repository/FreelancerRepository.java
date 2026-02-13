package com.freelaconnect.api.repository;

import com.freelaconnect.api.model.Category;
import com.freelaconnect.api.model.Freelancer;
import com.freelaconnect.api.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FreelancerRepository extends JpaRepository<Freelancer, Long> {
  Optional<Freelancer> findByUser(User user);
  List<Freelancer> findByFullNameContainingIgnoreCase(String name);
}
