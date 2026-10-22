package com.autobridge.repo;

import com.autobridge.model.Enquiry;
import com.autobridge.model.EnquiryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {

    List<Enquiry> findAllByOrderByCreatedAtDesc();

    List<Enquiry> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    long countByStatusIn(Collection<EnquiryStatus> statuses);

    long countByCustomerId(Long customerId);

    long countByCustomerIdAndStatusIn(Long customerId, Collection<EnquiryStatus> statuses);

    void deleteByVehicleId(Long vehicleId);
}
