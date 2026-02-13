package com.freelaconnect.api;

import com.freelaconnect.api.model.Category;
import com.freelaconnect.api.repository.CategoryRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class FreelaConnectApplication {

  public static void main(String[] args) {
    SpringApplication.run(FreelaConnectApplication.class, args);
  }

  @Bean
  CommandLineRunner seedCategories(CategoryRepository categoryRepository) {
    return args -> {
      if (categoryRepository.count() == 0) {
        List<String> names =
            List.of("Designers", "Developers / Coders", "Tutors", "Video Editors", "Photo Editor");
        for (String name : names) {
          Category category = new Category();
          category.setName(name);
          categoryRepository.save(category);
        }
      }
    };
  }
}
