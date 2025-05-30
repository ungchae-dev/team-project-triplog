package com.javago.triplog.domain.post_hashtag_people.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.javago.triplog.domain.post_hashtag_people.entity.Post_Hashtag_people;
import com.javago.triplog.domain.post_hashtag_people.repository.PostHashtagPeopleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostHashtagPeopleService {

    private final PostHashtagPeopleRepository postHashtagPeopleRepository;

    public List<Post_Hashtag_people> findHashtagList(Long postId){
        return postHashtagPeopleRepository.findByPostId(postId);
    }
    
}
