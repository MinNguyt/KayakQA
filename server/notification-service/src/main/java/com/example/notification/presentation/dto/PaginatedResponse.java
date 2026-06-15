package com.example.notification.presentation.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class PaginatedResponse<T> {
    private List<T> results;
    private Integer total;
    private Integer page;
    private Integer limit;
}
