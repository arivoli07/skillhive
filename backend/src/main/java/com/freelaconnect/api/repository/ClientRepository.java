package com.freelaconnect.api.repository;

import com.freelaconnect.api.model.Client;
import com.freelaconnect.api.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {
  Optional<Client> findByUser(User user);
}
