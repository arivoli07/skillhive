package com.freelaconnect.api.repository;

import com.freelaconnect.api.model.Client;
import com.freelaconnect.api.model.Freelancer;
import com.freelaconnect.api.model.ProjectRequest;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRequestRepository extends JpaRepository<ProjectRequest, Long> {
  List<ProjectRequest> findByFreelancer(Freelancer freelancer);
  List<ProjectRequest> findByClient(Client client);
}
