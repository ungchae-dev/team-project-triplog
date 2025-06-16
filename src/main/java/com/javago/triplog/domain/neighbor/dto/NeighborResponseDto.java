package com.javago.triplog.domain.neighbor.dto;

import com.javago.triplog.domain.member.entity.Member;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NeighborResponseDto {
    
    private String nickname;
    private String memberId;
    private String profileImage;

    // Member 객체에서 DTO로 변환하는 생성자
    public NeighborResponseDto(Member member) {
        this.nickname = member.getNickname();
        this.memberId = member.getMemberId();
        this.profileImage = member.getProfileImage();
    }


}
