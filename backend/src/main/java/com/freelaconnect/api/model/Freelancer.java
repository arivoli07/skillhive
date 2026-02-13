package com.freelaconnect.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "freelancers")
@Getter
@Setter
@NoArgsConstructor
public class Freelancer {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(optional = false)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  @JsonIgnore
  private User user;

  @Column(nullable = false)
  private String fullName;

  @Column(length = 1000)
  private String bio;

  @Column(length = 1000)
  private String skills;

  @ManyToMany
  @JoinTable(
      name = "freelancer_categories",
      joinColumns = @JoinColumn(name = "freelancer_id"),
      inverseJoinColumns = @JoinColumn(name = "category_id"))
  private Set<Category> categories = new HashSet<>();

  private String whatsapp;
  private String contactEmail;
  @Lob
  @Column(columnDefinition = "LONGTEXT")
  private String profilePhotoUrl;
}
