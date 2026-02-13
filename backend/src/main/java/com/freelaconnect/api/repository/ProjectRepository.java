package com.freelaconnect.api.repository;

import com.freelaconnect.api.model.Client;
import com.freelaconnect.api.model.Freelancer;
import com.freelaconnect.api.model.Project;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
  List<Project> findByClient(Client client);
  List<Project> findByFreelancer(Freelancer freelancer);
}
