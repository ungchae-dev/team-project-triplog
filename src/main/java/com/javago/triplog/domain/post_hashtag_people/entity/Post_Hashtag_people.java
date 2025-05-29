package com.javago.triplog.domain.post_hashtag_people.entity;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.javago.triplog.domain.hashtag_people.entity.Hashtag_People;
import com.javago.triplog.domain.post.entity.Post;

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
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "post_hashtag_people")
@EntityListeners(AuditingEntityListener.class)
public class Post_Hashtag_people {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_hashtag_people_seq")
    @SequenceGenerator(name = "post_hashtag_people_seq", sequenceName = "post_hashtag_people_seq", allocationSize = 1)
    @Column(name = "post_tag_id", updatable = false)
    private Long postTagId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", updatable = false, nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tag_id", updatable = false, nullable = false)
    private Hashtag_People hashtagPeople;

}
