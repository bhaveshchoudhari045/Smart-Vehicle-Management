
package com.autobridge.dto;

import com.autobridge.model.Enquiry;
import com.autobridge.model.EnquiryStatus;
import com.autobridge.model.EnquiryType;
import com.autobridge.model.EnquiryAvailability;
import com.autobridge.model.Vehicle;

import java.time.Instant;

public record EnquiryDto(
        Long id,
        String customerName,
        String customerEmail,
        Long vehicleId,
        String vehicleName,
        String vehicleImage,
        EnquiryType type,
        EnquiryStatus status,
        EnquiryAvailability availability,
        String showroomResponse,
        String expectedWait,
        String message,
        Instant createdAt) {

    public static EnquiryDto of(Enquiry e) {
        Vehicle v = e.getVehicle();

        return new EnquiryDto(
                e.getId(),
                e.getCustomer().getFullName(),
                e.getCustomer().getEmail(),
                v.getId(),
                v.getBrand() + " " + v.getModel(),
                v.getImageUrl(),
                e.getType(),
                e.getStatus(),
                e.getAvailability(),
                e.getShowroomResponse(),
                e.getExpectedWait(),
                e.getMessage(),
                e.getCreatedAt());
    }
}
