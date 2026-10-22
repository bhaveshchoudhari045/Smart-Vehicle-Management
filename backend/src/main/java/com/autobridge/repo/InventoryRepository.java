package com.autobridge.repo;

import com.autobridge.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    @Query("select distinct i.showroom from Inventory i order by i.showroom")
    List<String> findDistinctShowrooms();

    void deleteByVehicleId(Long vehicleId);
}
