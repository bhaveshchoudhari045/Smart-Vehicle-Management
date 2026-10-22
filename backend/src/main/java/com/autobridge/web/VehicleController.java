package com.autobridge.web;

import com.autobridge.model.Inventory;
import com.autobridge.model.Vehicle;
import com.autobridge.repo.EnquiryRepository;
import com.autobridge.repo.InventoryRepository;
import com.autobridge.repo.VehicleRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleRepository vehicles;
    private final InventoryRepository inventory;
    private final EnquiryRepository enquiries;

    public VehicleController(VehicleRepository vehicles, InventoryRepository inventory,
                             EnquiryRepository enquiries) {
        this.vehicles = vehicles;
        this.inventory = inventory;
        this.enquiries = enquiries;
    }

    @GetMapping
    public List<Vehicle> list() {
        return vehicles.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @GetMapping("/{id}")
    public Vehicle get(@PathVariable Long id) {
        return vehicles.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Vehicle not found"));
    }

    @PostMapping
    @PreAuthorize("hasRole('MANUFACTURER')")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Vehicle create(@Valid @RequestBody Vehicle body) {
        body.setId(null);
        Vehicle saved = vehicles.save(body);
        // Make the new vehicle visible in every showroom's inventory with zero stock.
        for (String showroom : inventory.findDistinctShowrooms()) {
            inventory.save(new Inventory(saved, showroom, 0, 0));
        }
        return saved;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANUFACTURER')")
    public Vehicle update(@PathVariable Long id, @Valid @RequestBody Vehicle body) {
        Vehicle v = get(id);
        v.setBrand(body.getBrand());
        v.setModel(body.getModel());
        v.setModelYear(body.getModelYear());
        v.setCategory(body.getCategory());
        v.setFuelType(body.getFuelType());
        v.setTransmission(body.getTransmission());
        v.setPrice(body.getPrice());
        v.setEngine(body.getEngine());
        v.setDescription(body.getDescription());
        v.setImageUrl(body.getImageUrl());
        v.setAvailable(body.isAvailable());
        return vehicles.save(v);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANUFACTURER')")
    @Transactional
    public Map<String, String> delete(@PathVariable Long id) {
        Vehicle v = get(id);
        enquiries.deleteByVehicleId(id);
        inventory.deleteByVehicleId(id);
        vehicles.delete(v);
        return Map.of("message", "Vehicle deleted");
    }
}
