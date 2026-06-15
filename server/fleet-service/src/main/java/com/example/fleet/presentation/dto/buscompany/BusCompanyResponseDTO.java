package com.example.fleet.presentation.dto.buscompany;

import com.example.fleet.domain.model.BusCompany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusCompanyResponseDTO {
    private Integer id;
    private String companyName;
    private String image;
    private String logoUrl;
    private String contactPhone;
    private String contactEmail;
    private String address;
    private String markdownContent;
    private String markdownHtml;
    private String descriptions;
    private Integer isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BusCompanyResponseDTO fromEntity(BusCompany entity) {
        return BusCompanyResponseDTO.builder()
                .id(entity.getId())
                .companyName(entity.getCompanyName())
                .image(entity.getImage())
                .logoUrl(entity.getLogoUrl())
                .contactPhone(entity.getContactPhone())
                .contactEmail(entity.getContactEmail())
                .address(entity.getAddress())
                .markdownContent(entity.getMarkdownContent())
                .markdownHtml(entity.getMarkdownHtml())
                .descriptions(entity.getDescriptions())
                .isActive(entity.getIsActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
