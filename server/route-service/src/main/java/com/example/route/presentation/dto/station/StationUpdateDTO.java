package com.example.route.presentation.dto.station;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StationUpdateDTO {
    private String name;
    private String descriptions;
    private String location;
    private String city;
    private String province;
    private MultipartFile image;
    private MultipartFile wallpaper;
}
