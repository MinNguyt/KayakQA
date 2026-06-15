package com.example.fleet.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bus_companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@ToString
public class BusCompany {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "company_name", nullable = false, length = 50)
    private String companyName;

    @Column(nullable = true)
    private String image;

    @Column(name = "logo_url", nullable = false)
    private String logoUrl;

    @Column(name = "contact_phone", nullable = true)
    private String contactPhone;

    @Column(name = "contact_email", nullable = true)
    private String contactEmail;

    @Column(nullable = false)
    private String address;

    @Column(name = "markdown_content", columnDefinition = "TEXT")
    private String markdownContent;

    @Column(name = "markdown_html", columnDefinition = "TEXT")
    private String markdownHtml;

    @Column(columnDefinition = "TEXT")
    private String descriptions;

    @Column(name = "is_active", nullable = false)
    private Integer isActive;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
        if (isActive == null) {
            isActive = 1;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
