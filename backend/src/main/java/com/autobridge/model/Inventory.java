package com.autobridge.model;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @Column(nullable = false, length = 100)
    private String showroom;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private int soldCount;

    public Inventory() {
    }

    public Inventory(Vehicle vehicle, String showroom, int quantity, int soldCount) {
        this.vehicle = vehicle;
        this.showroom = showroom;
        this.quantity = quantity;
        this.soldCount = soldCount;
    }

    public Long getId() { return id; }
    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }
    public String getShowroom() { return showroom; }
    public void setShowroom(String showroom) { this.showroom = showroom; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public int getSoldCount() { return soldCount; }
    public void setSoldCount(int soldCount) { this.soldCount = soldCount; }
}
