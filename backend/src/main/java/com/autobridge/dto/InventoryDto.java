package com.autobridge.dto;

import com.autobridge.model.Inventory;
import com.autobridge.model.Vehicle;

public record InventoryDto(
        Long id,
        Long vehicleId,
        String vehicleName,
        String category,
        String imageUrl,
        String showroom,
        int quantity,
        int soldCount,
        String status
) {
    public static final int LOW_STOCK_LIMIT = 3;

    public static String statusOf(int quantity) {
        if (quantity <= 0) return "OUT_OF_STOCK";
        if (quantity <= LOW_STOCK_LIMIT) return "LOW_STOCK";
        return "IN_STOCK";
    }

    public static InventoryDto of(Inventory i) {
        Vehicle v = i.getVehicle();
        return new InventoryDto(
                i.getId(),
                v.getId(),
                v.getBrand() + " " + v.getModel(),
                v.getCategory(),
                v.getImageUrl(),
                i.getShowroom(),
                i.getQuantity(),
                i.getSoldCount(),
                statusOf(i.getQuantity())
        );
    }
}
