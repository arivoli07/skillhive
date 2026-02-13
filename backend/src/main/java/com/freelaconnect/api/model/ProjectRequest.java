package com.freelaconnect.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "project_requests")
@Getter
@Setter
@NoArgsConstructor
public class ProjectRequest {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "client_id", nullable = false)
  @JsonIgnoreProperties({"user"})
  private Client client;

  @ManyToOne(optional = false)
  @JoinColumn(name = "freelancer_id", nullable = false)
  @JsonIgnoreProperties({"user"})
  private Freelancer freelancer;

  @Column(nullable = false)
  private String type;

  @Column(length = 2000)
  private String description;

  private String duration;

  private String salary;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private RequestStatus status = RequestStatus.PENDING;

  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();
}
