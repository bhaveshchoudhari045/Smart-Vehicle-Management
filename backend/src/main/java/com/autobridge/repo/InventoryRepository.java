
package com.autobridge.repo;

import com.autobridge.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    @Query("select distinct i.showroom from Inventory i order by i.showroom")
    List<String> findDistinctShowrooms();

    List<Inventory> findByShowroomIgnoreCaseOrderByShowroomAscIdAsc(String showroom);

    Optional<Inventory> findByVehicleIdAndShowroomIgnoreCase(Long vehicleId, String showroom);

    void deleteByVehicleId(Long vehicleId);
}
