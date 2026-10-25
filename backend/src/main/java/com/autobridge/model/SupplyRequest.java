package com.autobridge.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "supply_requests")
public class SupplyRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "showroom_user_id", nullable = false)
    private User showroomUser;

    @Column(nullable = false, length = 100)
    private String showroomName;

    @Column(nullable = false)
    private int quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SupplyRequestStatus status = SupplyRequestStatus.REQUESTED;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @Version
    private Long version;

    public SupplyRequest() {
    }

    public SupplyRequest(Vehicle vehicle, User showroomUser, String showroomName, int quantity) {
        this.vehicle = vehicle;
        this.showroomUser = showroomUser;
        this.showroomName = showroomName;
        this.quantity = quantity;
        this.status = SupplyRequestStatus.REQUESTED;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Vehicle getVehicle() { return vehicle; }
    public User getShowroomUser() { return showroomUser; }
    public String getShowroomName() { return showroomName; }
    public int getQuantity() { return quantity; }
    public SupplyRequestStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Long getVersion() { return version; }

    public void setStatus(SupplyRequestStatus status) {
        this.status = status;
    }
}
