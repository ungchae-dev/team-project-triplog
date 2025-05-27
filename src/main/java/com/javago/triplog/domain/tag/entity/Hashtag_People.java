package com.javago.triplog.domain.tag.entity;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.Check;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;

@Entity
@Getter
@Table(name = "hashtag_people")
@Check(constraints = "tag_type IN ('hashtag', 'people')")
@EntityListeners(AuditingEntityListener.class)
public class Hashtag_People {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hashtag_people_seq")
    @SequenceGenerator(name = "hashtag_people_seq", sequenceName = "hashtag_people_seq", allocationSize = 1)
    @Column(name = "tag_id", updatable = false)
    private Long tag_id;

    @Column(name = "tag_name", nullable = false, updatable = false)
    private String tag_name;

    @Column(name = "tag_type", nullable = false, updatable = false)
    private String tag_type;

    // 해시태그 관계
    @OneToMany(mappedBy = "hashtag_people", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Post_Hashtag_people> post_hashtag_people = new ArrayList<>();

}
