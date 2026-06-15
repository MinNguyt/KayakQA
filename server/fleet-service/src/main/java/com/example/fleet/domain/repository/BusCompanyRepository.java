package com.example.fleet.domain.repository;

import com.example.fleet.domain.model.BusCompany;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusCompanyRepository extends JpaRepository<BusCompany, Integer> {

    Optional<BusCompany> findByCompanyName(String companyName);

    @Query("SELECT bc FROM BusCompany bc WHERE " +
            "(:search IS NULL OR :search = '' OR bc.companyName LIKE CONCAT('%', :search, '%'))")
    Page<BusCompany> findAllByPagination(Pageable pageable, @Param("search") String search);

    boolean existsByCompanyName(String companyName);
}
