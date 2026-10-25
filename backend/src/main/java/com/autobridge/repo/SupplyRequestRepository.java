package com.autobridge.repo;

import com.autobridge.model.SupplyRequest;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SupplyRequestRepository extends JpaRepository<SupplyRequest, Long> {

    List<SupplyRequest> findAllByOrderByCreatedAtDesc();

    List<SupplyRequest> findByShowroomUserIdOrderByCreatedAtDesc(Long showroomUserId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from SupplyRequest s where s.id = :id")
    Optional<SupplyRequest> findByIdForUpdate(@Param("id") Long id);
}
