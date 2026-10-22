package com.autobridge.web;

import com.autobridge.dto.InventoryDto;
import com.autobridge.model.Inventory;
import com.autobridge.repo.InventoryRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    public record QuantityRequest(
            @Min(value = 1, message = "Quantity must be at least 1")
            @Max(value = 1000, message = "Quantity must be at most 1000") int quantity) {
    }

    private final InventoryRepository inventory;

    public InventoryController(InventoryRepository inventory) {
        this.inventory = inventory;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANUFACTURER','SHOWROOM')")
    public List<InventoryDto> list() {
        return inventory.findAll().stream()
                .sorted(Comparator.comparing(Inventory::getShowroom)
                        .thenComparing(i -> i.getVehicle().getBrand())
                        .thenComparing(i -> i.getVehicle().getModel()))
                .map(InventoryDto::of)
                .toList();
    }

    /** Confirm a delivery: adds units to stock. */
    @PostMapping("/{id}/delivery")
    @PreAuthorize("hasRole('SHOWROOM')")
    @Transactional
    public InventoryDto delivery(@PathVariable Long id, @Valid @RequestBody QuantityRequest req) {
        Inventory i = find(id);
        i.setQuantity(i.getQuantity() + req.quantity());
        return InventoryDto.of(inventory.save(i));
    }

    /** Record a sale: removes units from stock and increases the sold counter. */
    @PostMapping("/{id}/sale")
    @PreAuthorize("hasRole('SHOWROOM')")
    @Transactional
    public InventoryDto sale(@PathVariable Long id, @Valid @RequestBody QuantityRequest req) {
        Inventory i = find(id);
        if (req.quantity() > i.getQuantity()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Only " + i.getQuantity() + " unit(s) in stock, cannot record a sale of " + req.quantity());
        }
        i.setQuantity(i.getQuantity() - req.quantity());
        i.setSoldCount(i.getSoldCount() + req.quantity());
        return InventoryDto.of(inventory.save(i));
    }

    private Inventory find(Long id) {
        return inventory.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Inventory entry not found"));
    }
}
