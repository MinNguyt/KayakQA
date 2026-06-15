package com.example.fleet.presentation.dto.buscompany;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusCompanyUpdateDTO {
    private String companyName;
    private String logoUrl;
    private String contactPhone;
    private String contactEmail;
    private String address;
    private String markdownContent;
    private String markdownHtml;
    private String descriptions;
    private Integer isActive;
}
