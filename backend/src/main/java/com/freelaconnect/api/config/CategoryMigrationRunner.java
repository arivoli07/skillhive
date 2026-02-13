package com.freelaconnect.api.config;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import javax.sql.DataSource;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class CategoryMigrationRunner {

  @Bean
  public ApplicationRunner backfillFreelancerCategories(DataSource dataSource) {
    return args -> {
      try (Connection connection = dataSource.getConnection()) {
        DatabaseMetaData meta = connection.getMetaData();
        if (!hasColumn(meta, "freelancers", "category_id")) {
          return;
        }
        if (!hasTable(meta, "freelancer_categories")) {
          return;
        }
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update(
            "update categories set name = 'Photo Editor' where name = 'Photo Editors'");
        String sql =
            "insert into freelancer_categories (freelancer_id, category_id) "
                + "select f.id, f.category_id from freelancers f "
                + "where f.category_id is not null "
                + "and not exists ("
                + "  select 1 from freelancer_categories fc "
                + "  where fc.freelancer_id = f.id and fc.category_id = f.category_id"
                + ")";
        jdbc.update(sql);
      }
    };
  }

  private boolean hasTable(DatabaseMetaData meta, String tableName) throws Exception {
    try (ResultSet rs = meta.getTables(null, null, tableName, null)) {
      return rs.next();
    }
  }

  private boolean hasColumn(DatabaseMetaData meta, String tableName, String columnName)
      throws Exception {
    try (ResultSet rs = meta.getColumns(null, null, tableName, columnName)) {
      return rs.next();
    }
  }
}
