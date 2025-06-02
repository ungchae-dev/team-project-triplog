package com.javago.triplog.domain.hashtag_people.entity;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.Check;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.javago.constant.Tag_Type;
import com.javago.triplog.domain.post_hashtag_people.entity.Post_Hashtag_people;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Check(constraints = "tag_type IN ('HASHTAG', 'PEOPLE')")
@EntityListeners(AuditingEntityListener.class)
public class Hashtag_People {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hashtag_people_seq")
    @SequenceGenerator(name = "hashtag_people_seq", sequenceName = "hashtag_people_seq", allocationSize = 1)
    @Column(name = "tag_id", updatable = false)
    private Long tagId;

    @Column(name = "tag_name", nullable = false, updatable = false)
    private String tagName;

    @Enumerated(EnumType.STRING)
    @Column(name = "tag_type", nullable = false, updatable = false)
    private Tag_Type tagType;

    // 해시태그 관계
    @OneToMany(mappedBy = "hashtagPeople", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Post_Hashtag_people> postHashtagPeople = new ArrayList<>();

}
