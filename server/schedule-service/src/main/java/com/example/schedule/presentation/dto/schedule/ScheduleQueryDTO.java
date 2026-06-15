package com.example.schedule.presentation.dto.schedule;

import com.example.schedule.domain.model.VehicleSchedule.ScheduleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleQueryDTO {

    private Integer page;
    private Integer limit;
    private Integer routeId;
    private Integer busId;
    private ScheduleStatus status;
    private String sortBy; // Format: "id:asc" or "departureTime:desc"

    public Integer getPage() {
        return page != null && page > 0 ? page : 1;
    }

    public Integer getLimit() {
        return limit != null && limit > 0 ? limit : 50;
    }
}
