package com.example.route.presentation.dto.station;

import com.example.route.domain.model.Station;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StationResponseDTO {
    private Integer id;
    private String name;
    private String image;
    private String wallpaper;
    private String descriptions;
    private String location;
    private String city;
    private String province;
    private Integer isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static StationResponseDTO fromEntity(Station station) {
        return StationResponseDTO.builder()
                .id(station.getId())
                .name(station.getName())
                .image(station.getImage())
                .wallpaper(station.getWallpaper())
                .descriptions(station.getDescriptions())
                .location(station.getLocation())
                .city(station.getCity())
                .province(station.getProvince())
                .isActive(station.getIsActive())
                .createdAt(station.getCreatedAt())
                .updatedAt(station.getUpdatedAt())
                .build();
    }
}
