package com.javago.triplog.domain.mylog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.javago.triplog.domain.mylog.entity.Mylog_tour;

@Repository("MylogTourRepository")
public interface MylogTourRepository extends JpaRepository<Mylog_tour, Long> {
    
}
