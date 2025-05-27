package com.javago.triplog.domain.post.entity;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.javago.triplog.domain.mylog.entity.Mylog_tour;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;

@Table(name = "post_tour")
@Entity
@Getter
@EntityListeners(AuditingEntityListener.class)
public class Post_tour {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_tour_seq")
    @SequenceGenerator(name = "post_tour_seq", sequenceName = "post_tour_seq", allocationSize = 1)
    @Column(name = "post_tour_id", updatable = false)
    private Long post_tour_id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "post_id", updatable = false, nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "item_id", updatable = false, nullable = false)
    private Mylog_tour mylog_tour;
    
}
