package com.example.fleet.presentation.dto.vehicle;

import com.example.fleet.domain.model.Vehicle;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponseDTO {
    private Integer id;
    private String name;
    private String licensePlate;
    private Integer capacity;
    private Integer companyId;
    private String companyName;
    private String featuredImage;
    private String markdownContent;
    private String markdownHtml;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static VehicleResponseDTO fromEntity(Vehicle entity) {
        return VehicleResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .licensePlate(entity.getLicensePlate())
                .capacity(entity.getCapacity())
                .companyId(entity.getBusCompany() != null ? entity.getBusCompany().getId() : null)
                .companyName(entity.getBusCompany() != null ? entity.getBusCompany().getCompanyName() : null)
                .featuredImage(entity.getFeaturedImage())
                .markdownContent(entity.getMarkdownContent())
                .markdownHtml(entity.getMarkdownHtml())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
