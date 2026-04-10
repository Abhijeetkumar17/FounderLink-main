package com.capgemini.notification.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Configuration
@Slf4j
public class DatabaseSchemaFixer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixSchema() {
        try {
            log.info("Checking and fixing database constraints for NotificationService...");
            // Drop the old check constraint that might be blocking new enum values
            jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");
            log.info("Successfully dropped 'notifications_type_check' constraint if it existed.");
        } catch (Exception e) {
            log.error("Failed to drop constraint: {}", e.getMessage());
            // This is okay if the constraint doesn't exist or we don't have permissions
        }
    }
}
