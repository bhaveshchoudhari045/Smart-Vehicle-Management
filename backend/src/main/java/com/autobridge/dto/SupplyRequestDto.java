package com.autobridge.dto;

import com.autobridge.model.SupplyRequest;
import java.time.Instant;

public record SupplyRequestDto(
        Long id,
        Long vehicleId,
        String vehicleName,
        String imageUrl,
        String showroomName,
        int quantity,
        String status,
        Instant createdAt,
        Instant updatedAt
) {
    public static SupplyRequestDto of(SupplyRequest request) {
        return new SupplyRequestDto(
                request.getId(),
                request.getVehicle().getId(),
                request.getVehicle().getBrand() + " " + request.getVehicle().getModel(),
                request.getVehicle().getImageUrl(),
                request.getShowroomName(),
                request.getQuantity(),
                request.getStatus().name(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }
}
