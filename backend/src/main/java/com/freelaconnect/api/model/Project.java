package com.freelaconnect.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
public class Project {
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
  private String title;

  @Column(length = 2000)
  private String description;

  private String serviceName;

  private String duration;

  private String deadline;

  private Double salary;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ProjectStatus status = ProjectStatus.PENDING;

  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  @Column(nullable = false)
  private Instant updatedAt = Instant.now();
}
