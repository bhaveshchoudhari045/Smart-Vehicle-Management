
package com.autobridge.web;

import com.autobridge.dto.EnquiryDto;
import com.autobridge.model.*;
import com.autobridge.repo.EnquiryRepository;
import com.autobridge.repo.VehicleRepository;
import com.autobridge.service.EmailService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/enquiries")
public class EnquiryController {

    public record CreateRequest(
            @NotNull(message = "Choose a vehicle") Long vehicleId,
            @NotNull(message = "Choose an enquiry type") EnquiryType type,
            @Size(max = 500, message = "Message can be at most 500 characters")
            String message) {
    }

    public record StatusRequest(
            @NotNull(message = "Status is required") EnquiryStatus status,
            EnquiryAvailability availability,
            @Size(max = 1000, message = "Response can be at most 1000 characters")
            String showroomResponse,
            @Size(max = 100, message = "Waiting time can be at most 100 characters")
            String expectedWait) {
    }

    private final EnquiryRepository enquiries;
    private final VehicleRepository vehicles;
    private final EmailService emailService;

    public EnquiryController(
            EnquiryRepository enquiries,
            VehicleRepository vehicles,
            EmailService emailService) {
        this.enquiries = enquiries;
        this.vehicles = vehicles;
        this.emailService = emailService;
    }

    @GetMapping
    public List<EnquiryDto> list(@AuthenticationPrincipal User user) {
        List<Enquiry> rows = user.getRole() == Role.CUSTOMER
                ? enquiries.findByCustomerIdOrderByCreatedAtDesc(user.getId())
                : enquiries.findAllByOrderByCreatedAtDesc();

        return rows.stream().map(EnquiryDto::of).toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @ResponseStatus(HttpStatus.CREATED)
    public EnquiryDto create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateRequest req) {

        Vehicle vehicle = vehicles.findById(req.vehicleId())
                .orElseThrow(() ->
                        new ApiException(HttpStatus.NOT_FOUND, "Vehicle not found"));

        String message = req.message() == null ? null : req.message().trim();

        Enquiry saved = enquiries.save(
                new Enquiry(user, vehicle, req.type(),
                        EnquiryStatus.NEW, message, Instant.now()));

        emailService.sendConfirmation(saved);

        return EnquiryDto.of(saved);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANUFACTURER','SHOWROOM')")
    public EnquiryDto updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusRequest req) {

        Enquiry e = enquiries.findById(id)
                .orElseThrow(() ->
                        new ApiException(HttpStatus.NOT_FOUND, "Enquiry not found"));

        e.setStatus(req.status());

        if (req.availability() != null) {
            e.setAvailability(req.availability());
        }

        if (req.showroomResponse() != null) {
            e.setShowroomResponse(req.showroomResponse().trim());
        }

        if (req.expectedWait() != null) {
            e.setExpectedWait(req.expectedWait().trim());
        }

        Enquiry saved = enquiries.save(e);

        emailService.sendStatusUpdate(saved);

        return EnquiryDto.of(saved);
    }
}
