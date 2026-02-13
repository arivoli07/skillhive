package com.freelaconnect.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
public class Review {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(optional = false)
  @JoinColumn(name = "project_id", nullable = false, unique = true)
  @JsonIgnoreProperties({"client", "freelancer"})
  private Project project;

  @ManyToOne(optional = false)
  @JoinColumn(name = "client_id", nullable = false)
  @JsonIgnoreProperties({"user"})
  private Client client;

  @ManyToOne(optional = false)
  @JoinColumn(name = "freelancer_id", nullable = false)
  @JsonIgnoreProperties({"user"})
  private Freelancer freelancer;

  @Column(nullable = false)
  private Integer rating;

  @Column(length = 1500)
  private String comment;

  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();
}
