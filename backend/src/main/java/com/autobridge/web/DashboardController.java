package com.autobridge.web;

import com.autobridge.model.*;
import com.autobridge.repo.EnquiryRepository;
import com.autobridge.repo.InventoryRepository;
import com.autobridge.repo.UserRepository;
import com.autobridge.repo.VehicleRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

/** Summary numbers for the dashboard, always computed from the stored records. */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private static final List<EnquiryStatus> OPEN = List.of(EnquiryStatus.NEW, EnquiryStatus.IN_PROGRESS);

    private final VehicleRepository vehicles;
    private final InventoryRepository inventory;
    private final EnquiryRepository enquiries;
    private final UserRepository users;

    public DashboardController(VehicleRepository vehicles, InventoryRepository inventory,
                               EnquiryRepository enquiries, UserRepository users) {
        this.vehicles = vehicles;
        this.inventory = inventory;
        this.enquiries = enquiries;
        this.users = users;
    }

    @GetMapping
    public Map<String, Object> summary(@AuthenticationPrincipal User user) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalVehicles", vehicles.count());
        m.put("availableVehicles", vehicles.countByAvailableTrue());

        Map<String, Long> vehiclesByCategory = new TreeMap<>();
        for (Vehicle v : vehicles.findAll()) {
            vehiclesByCategory.merge(v.getCategory(), 1L, Long::sum);
        }
        m.put("vehiclesByCategory", vehiclesByCategory);

        if (user.getRole() == Role.CUSTOMER) {
            m.put("enquiriesTotal", enquiries.countByCustomerId(user.getId()));
            m.put("enquiriesOpen", enquiries.countByCustomerIdAndStatusIn(user.getId(), OPEN));
            return m;
        }

        m.put("enquiriesTotal", enquiries.count());
        m.put("enquiriesOpen", enquiries.countByStatusIn(OPEN));
        m.put("customers", users.countByRole(Role.CUSTOMER));

        long totalStock = 0, lowStock = 0, unitsSold = 0, stockValue = 0;
        Map<String, Long> stockByCategory = new TreeMap<>();
        for (Inventory i : inventory.findAll()) {
            totalStock += i.getQuantity();
            unitsSold += i.getSoldCount();
            stockValue += (long) i.getQuantity() * i.getVehicle().getPrice();
            String status = com.autobridge.dto.InventoryDto.statusOf(i.getQuantity());
            if (!status.equals("IN_STOCK")) lowStock++;
            stockByCategory.merge(i.getVehicle().getCategory(), (long) i.getQuantity(), Long::sum);
        }
        m.put("totalStock", totalStock);
        m.put("lowStockLines", lowStock);
        m.put("unitsSold", unitsSold);
        m.put("stockValue", stockValue);
        m.put("stockByCategory", stockByCategory);
        return m;
    }
}
