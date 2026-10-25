package com.autobridge.web;

import com.autobridge.dto.SupplyRequestDto;
import com.autobridge.model.*;
import com.autobridge.repo.InventoryRepository;
import com.autobridge.repo.SupplyRequestRepository;
import com.autobridge.repo.VehicleRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supply-requests")
public class SupplyRequestController {

    public record CreateRequest(
            @Min(value = 1, message = "Quantity must be at least 1")
            @Max(value = 1000, message = "Quantity must be at most 1000")
            int quantity,
            @jakarta.validation.constraints.NotNull(message = "Vehicle ID is required")
            Long vehicleId) {
    }

    private final SupplyRequestRepository requests;
    private final VehicleRepository vehicles;
    private final InventoryRepository inventory;

    public SupplyRequestController(
            SupplyRequestRepository requests,
            VehicleRepository vehicles,
            InventoryRepository inventory) {
        this.requests = requests;
        this.vehicles = vehicles;
        this.inventory = inventory;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANUFACTURER','SHOWROOM')")
    public List<SupplyRequestDto> list(@AuthenticationPrincipal User user) {
        List<SupplyRequest> result = user.getRole() == Role.MANUFACTURER
                ? requests.findAllByOrderByCreatedAtDesc()
                : requests.findByShowroomUserIdOrderByCreatedAtDesc(user.getId());

        return result.stream().map(SupplyRequestDto::of).toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('SHOWROOM')")
    @Transactional
    public SupplyRequestDto create(
            @Valid @RequestBody CreateRequest body,
            @AuthenticationPrincipal User user) {

        String showroom = requireShowroom(user);

        Vehicle vehicle = vehicles.findById(body.vehicleId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Vehicle not found"));

        if (!vehicle.isAvailable()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "This vehicle is not currently available for supply.");
        }

        if (inventory.findByVehicleIdAndShowroomIgnoreCase(
                vehicle.getId(), showroom).isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "No inventory record exists for this vehicle at your assigned showroom.");
        }

        SupplyRequest request = new SupplyRequest(
                vehicle, user, showroom, body.quantity());

        return SupplyRequestDto.of(requests.save(request));
    }

    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('MANUFACTURER')")
    @Transactional
    public SupplyRequestDto accept(@PathVariable Long id) {
        SupplyRequest request = findForUpdate(id);
        requireStatus(request, SupplyRequestStatus.REQUESTED,
                "Only requested supplies can be accepted.");
        request.setStatus(SupplyRequestStatus.ACCEPTED);
        return SupplyRequestDto.of(requests.save(request));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANUFACTURER')")
    @Transactional
    public SupplyRequestDto reject(@PathVariable Long id) {
        SupplyRequest request = findForUpdate(id);
        requireStatus(request, SupplyRequestStatus.REQUESTED,
                "Only requested supplies can be rejected.");
        request.setStatus(SupplyRequestStatus.REJECTED);
        return SupplyRequestDto.of(requests.save(request));
    }

    @PostMapping("/{id}/dispatch")
    @PreAuthorize("hasRole('MANUFACTURER')")
    @Transactional
    public SupplyRequestDto dispatch(@PathVariable Long id) {
        SupplyRequest request = findForUpdate(id);
        requireStatus(request, SupplyRequestStatus.ACCEPTED,
                "Only accepted supplies can be dispatched.");
        request.setStatus(SupplyRequestStatus.DISPATCHED);
        return SupplyRequestDto.of(requests.save(request));
    }

    @PostMapping("/{id}/deliver")
    @PreAuthorize("hasRole('SHOWROOM')")
    @Transactional
    public SupplyRequestDto deliver(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        String showroom = requireShowroom(user);
        SupplyRequest request = findForUpdate(id);

        if (!request.getShowroomUser().getId().equals(user.getId())
                || !request.getShowroomName().equalsIgnoreCase(showroom)) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "You can confirm delivery only for your own showroom requests.");
        }

        requireStatus(request, SupplyRequestStatus.DISPATCHED,
                "Only dispatched supplies can be delivered.");

        Inventory item = inventory.findByVehicleIdAndShowroomIgnoreCase(
                        request.getVehicle().getId(), showroom)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.CONFLICT,
                        "Inventory record not found for this showroom and vehicle."));

        try {
            item.setQuantity(Math.addExact(item.getQuantity(), request.getQuantity()));
        } catch (ArithmeticException ex) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "The resulting inventory quantity is too large.");
        }

        inventory.save(item);
        request.setStatus(SupplyRequestStatus.DELIVERED);
        return SupplyRequestDto.of(requests.save(request));
    }

    private SupplyRequest findForUpdate(Long id) {
        return requests.findByIdForUpdate(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Supply request not found"));
    }

    private void requireStatus(
            SupplyRequest request, SupplyRequestStatus expected, String message) {
        if (request.getStatus() != expected) {
            throw new ApiException(HttpStatus.CONFLICT, message);
        }
    }

    private String requireShowroom(User user) {
        String showroom = user.getShowroomName();
        if (showroom == null || showroom.isBlank()) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "This showroom account has no assigned location. Contact the administrator.");
        }
        return showroom;
    }
}
