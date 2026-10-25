package com.autobridge.web;

import com.autobridge.dto.InventoryDto;
import com.autobridge.model.Inventory;
import com.autobridge.model.Role;
import com.autobridge.model.User;
import com.autobridge.repo.InventoryRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    public record QuantityRequest(
            @Min(value = 1, message = "Quantity must be at least 1")
            @Max(value = 1000, message = "Quantity must be at most 1000")
            int quantity) {
    }

    private final InventoryRepository inventory;

    public InventoryController(InventoryRepository inventory) {
        this.inventory = inventory;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANUFACTURER','SHOWROOM')")
    public List<InventoryDto> list(@AuthenticationPrincipal User user) {
        List<Inventory> entries;

        if (user.getRole() == Role.MANUFACTURER) {
            entries = inventory.findAll();
        } else {
            String showroom = requireShowroom(user);
            entries = inventory.findByShowroomIgnoreCaseOrderByShowroomAscIdAsc(showroom);
        }

        return entries.stream()
                .sorted(Comparator.comparing(Inventory::getShowroom)
                        .thenComparing(i -> i.getVehicle().getBrand())
                        .thenComparing(i -> i.getVehicle().getModel()))
                .map(InventoryDto::of)
                .toList();
    }

    /**
     * Stock can no longer be increased directly.
     * A delivered supply request will be the only permitted stock-increase path.
     */
    @PostMapping("/{id}/delivery")
    @PreAuthorize("hasRole('SHOWROOM')")
    public InventoryDto delivery(
            @PathVariable Long id,
            @Valid @RequestBody QuantityRequest req) {
        throw new ApiException(
                HttpStatus.CONFLICT,
                "Direct deliveries are disabled. Confirm delivery through a dispatched supply request.");
    }

    /** Record a sale only against the authenticated showroom's inventory. */
    @PostMapping("/{id}/sale")
    @PreAuthorize("hasRole('SHOWROOM')")
    @Transactional
    public InventoryDto sale(
            @PathVariable Long id,
            @Valid @RequestBody QuantityRequest req,
            @AuthenticationPrincipal User user) {

        String showroom = requireShowroom(user);
        Inventory item = find(id);

        if (!item.getShowroom().equalsIgnoreCase(showroom)) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "You can only record sales for your assigned showroom.");
        }

        if (req.quantity() > item.getQuantity()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Only " + item.getQuantity()
                            + " unit(s) in stock, cannot record a sale of "
                            + req.quantity());
        }

        item.setQuantity(item.getQuantity() - req.quantity());
        item.setSoldCount(item.getSoldCount() + req.quantity());
        return InventoryDto.of(inventory.save(item));
    }

    private String requireShowroom(User user) {
        String showroom = user.getShowroomName();
        if (showroom == null || showroom.isBlank()) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "This showroom account has no assigned location. Contact the administrator.");
        }
        return showroom;
    }

    private Inventory find(Long id) {
        return inventory.findById(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Inventory entry not found"));
    }
}
