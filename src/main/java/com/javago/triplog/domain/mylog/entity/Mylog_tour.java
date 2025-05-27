package com.javago.triplog.domain.mylog.entity;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.Check;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.javago.triplog.domain.post.entity.Post_Mylog;
import com.javago.triplog.domain.post.entity.Post_tour;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;

@Table(name = "mylog_tour")
@Entity
@Getter
@EntityListeners(AuditingEntityListener.class)
@Check(constraints = "item_type IN ('MYLOG', 'TOUR')")
public class Mylog_tour {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "mylog_tour_seq")
    @SequenceGenerator(name = "mylog_tour_seq", sequenceName = "mylog_tour_seq", allocationSize = 1)
    @Column(name = "item_id", updatable = false)
    private Long item_id;

    @Column(name = "item_type", nullable = false, updatable = false)
    private String item_type;

    @Column(name = "item_name", nullable = false)
    private String item_name;

    @Column(name = "item_info")
    @Lob
    private String item_info;

    @Column(name = "area")
    private String area;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "tour_type", nullable = false, updatable = false)
    private String tour_type;

    @OneToMany(mappedBy = "mylog_tour", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Post_Mylog> post_mylog = new ArrayList<>();

    @OneToMany(mappedBy = "mylog_tour", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Post_tour> post_tour = new ArrayList<>();

}
