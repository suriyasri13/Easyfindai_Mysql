package com.lostfound.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class SchemaFixer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixSchema() {
        System.out.println("SCHEMA FIXER: Checking database columns...");
        try {
            // Lost Items Table
            try { jdbcTemplate.execute("ALTER TABLE lost_items ADD COLUMN is_confidential BOOLEAN DEFAULT FALSE"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE lost_items ADD COLUMN unique_identifier VARCHAR(255)"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE lost_items ADD COLUMN hidden_detail TEXT"); } catch (Exception e) {}

            // Found Items Table
            try { jdbcTemplate.execute("ALTER TABLE found_items ADD COLUMN is_confidential BOOLEAN DEFAULT FALSE"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE found_items ADD COLUMN unique_identifier VARCHAR(255)"); } catch (Exception e) {}
            try { jdbcTemplate.execute("ALTER TABLE found_items ADD COLUMN hidden_detail TEXT"); } catch (Exception e) {}

            System.out.println("SCHEMA FIXER: Database check complete.");
        } catch (Exception e) {
            System.err.println("SCHEMA FIXER ERROR: " + e.getMessage());
        }
    }
}
