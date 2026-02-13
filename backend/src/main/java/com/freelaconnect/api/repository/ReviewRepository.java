package com.freelaconnect.api.repository;

import com.freelaconnect.api.model.Freelancer;
import com.freelaconnect.api.model.Project;
import com.freelaconnect.api.model.Review;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {
  Optional<Review> findByProject(Project project);
  List<Review> findByFreelancer(Freelancer freelancer);

  @Query("select avg(r.rating) from Review r where r.freelancer = :freelancer")
  Double getAverageRating(@Param("freelancer") Freelancer freelancer);
}
