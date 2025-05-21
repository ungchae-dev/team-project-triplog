package com.javago.triplog.page.main.model;


import lombok.*;
import jakarta.persistence.*;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Post {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String imageUrl;
    private String region;

    @Enumerated(EnumType.STRING)
    private CategoryType category; // 행사, 관광지, 맛집

    private int likes;
    private String url;
}
