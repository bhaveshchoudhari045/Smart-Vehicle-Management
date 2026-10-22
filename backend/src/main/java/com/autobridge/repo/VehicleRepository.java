package com.autobridge.repo;

import com.autobridge.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    long countByAvailableTrue();
}
