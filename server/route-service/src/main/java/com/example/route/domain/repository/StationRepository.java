package com.example.route.domain.repository;

import com.example.route.domain.model.Station;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StationRepository extends JpaRepository<Station, Integer> {

    @Query("SELECT s FROM Station s WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(s.city) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(s.province) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Station> findAllByPagination(Pageable pageable, @Param("search") String search);
}
