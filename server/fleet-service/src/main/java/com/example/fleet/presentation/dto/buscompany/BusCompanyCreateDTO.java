package com.example.fleet.presentation.dto.buscompany;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusCompanyCreateDTO {

    @NotBlank(message = "Company name is required")
    private String companyName;

    private String logoUrl;
    private String contactPhone;
    private String contactEmail;
    private String address;
    private String markdownContent;
    private String markdownHtml;
    private String descriptions;
}
