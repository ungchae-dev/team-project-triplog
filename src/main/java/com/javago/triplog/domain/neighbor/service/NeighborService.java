package com.javago.triplog.domain.neighbor.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;
import com.javago.triplog.domain.neighbor.dto.NeighborResponseDto;
import com.javago.triplog.domain.neighbor.entity.Neighbor;
import com.javago.triplog.domain.neighbor.repository.NeighborRepository;

@Service
@Transactional
public class NeighborService {
    
    @Autowired
    private NeighborRepository neighborRepository;

    @Autowired
    private MemberService memberService;

    // === 이웃 등록/삭제 ===

    // 이웃 등록 (A가 B를 이웃으로 등록)
    /*
        memberNickname: 이웃을 등록하는 사람의 닉네임, 
        targetNickname: 이웃으로 등록될 사람의 닉네임
        return: 등록 성공 여부
    */
    public boolean addNeighbor(String memberNickname, String targetNickname) {

        try {
            Member member = memberService.findByNickname(memberNickname);
            Member targetMember = memberService.findByNickname(targetNickname);

            // 이미 이웃 관계가 있는지 확인
            if (neighborRepository.existsByMemberAndNeighborMember(member, targetMember)) {
                throw new IllegalStateException("이미 이웃으로 등록된 사용자입니다!");
            }

            // Neighbor 엔티티 생성 (Builder에서 자기 자신 등록 검증)
            Neighbor neighbor = Neighbor.builder()
                .member(member)
                .neighborMember(targetMember)
                .build();
            
            neighborRepository.save(neighbor);
            return true;

        } catch (Exception e) {
            throw new RuntimeException("이웃 등록 실패: " + e.getMessage());
        }

    }

    // 이웃 삭제 (A가 B를 이웃에서 제거)
    /*
        memberNickname: 이웃을 삭제하는 사람의 닉네임
        targetNickname: 이웃에서 제거될 사람의 닉네임
        return: 삭제 성공 여부
    */
    public boolean removeNeighbor(String memberNickname, String targetNickname) {

        try {
            Member member = memberService.findByNickname(memberNickname);
            Member targetMember = memberService.findByNickname(targetNickname);

            // 이웃 관계가 존재하는지 확인
            if (!neighborRepository.existsByMemberAndNeighborMember(member, targetMember)) {
                throw new IllegalStateException("이웃 관계가 존재하지 않습니다!");
            }

            neighborRepository.deleteByMemberAndNeighborMember(member, targetMember);
            return true;

        } catch (Exception e) {
            throw new RuntimeException("이웃 삭제 실패: " + e.getMessage());
        }

    }

    //
    // === 이웃 관계 조회 ===

    // 내가 등록한 이웃 목록 조회 (DTO 반환)
    /*
        nickname: 조회할 사용자의 닉네임
        return: 이웃 Member 리스트
    */
    @Transactional(readOnly = true)
    public List<NeighborResponseDto> getMyNeighbors(String nickname) {
        Member member = memberService.findByNickname(nickname);
        List<Neighbor> neighbors = neighborRepository.findByMemberOrderByNeighborIdDesc(member);

        return neighbors.stream()
            .map(neighbor -> new NeighborResponseDto(neighbor.getNeighborMember()))
            .collect(Collectors.toList());
    }

    // 나를 이웃으로 등록한 사람들 목록 조회 (DTO 반환)
    /*
        nickname: 조회할 사용자의 닉네임
        return: 팔로워 Member 리스트
    */
    @Transactional(readOnly = true)
    public List<NeighborResponseDto> getMyFollowers(String nickname) {
        Member member = memberService.findByNickname(nickname);
        List<Neighbor> followers = neighborRepository.findByNeighborMemberOrderByNeighborIdDesc(member);

        return followers.stream()
            .map(follower -> new NeighborResponseDto(follower.getMember()))
            .collect(Collectors.toList());
    }

    // 이웃 관계 통계 조회 (DTO 사용하여 계산)
    /*
        nickname: 조회할 사용자의 닉네임
        return: 이웃 수, 팔로워 수 등의 통계 정보
    */
    @Transactional(readOnly = true)
    public Map<String, Object> getNeighborStats(String nickname) {
        // 리스트 조회 후 size()로 계산 (COUNT 대신)
        List<NeighborResponseDto> myNeighbors = getMyNeighbors(nickname);
        List<NeighborResponseDto> myFollowers = getMyFollowers(nickname);

        return Map.of(
            "myNeighborCount", myNeighbors.size(), 
            "followerCount", myFollowers.size(), 
            "nickname", nickname
        );
    }

    // === 이웃 관계 확인 ===
    // 
    // 특정 사용자가 내 이웃인지 확인
    /*
        myNickname: 나의 닉네임
        targetNickname: 확인할 대상의 닉네임
        return: 이웃 여부
    */
    @Transactional(readOnly = true)
    public boolean isMyNeighbor(String myNickname, String targetNickname) {
        try {
            Member me = memberService.findByNickname(myNickname);
            Member target = memberService.findByNickname(targetNickname);

            return neighborRepository.existsByMemberAndNeighborMember(me, target);
        } catch (Exception e) {
            return false;
        }
    }

    // 특정 사용자가 나를 이웃으로 등록했는지 확인
    /*
        myNickname: 나의 닉네임
        targetNickname: 확인할 대상의 닉네임
        return: 팔로워 여부
    */
    @Transactional(readOnly = true)
    public boolean isMyFollower(String myNickname, String targetNickname) {
        try {
            Member me = memberService.findByNickname(myNickname);
            Member target = memberService.findByNickname(targetNickname);
            
            return neighborRepository.existsByMemberAndNeighborMember(target, me);
        } catch (Exception e) {
            return false;
        }
    }

    // 서로 이웃인지 확인 (맞팔로우)
    /*
        nickname1: 첫 번째 사용자 닉네임
        nickname2: 두 번째 사용자 닉네임
        return: 맞팔로우 여부
    */
    @Transactional(readOnly = true)
    public boolean isMutualNeighbor(String nickname1, String nickname2) {
        return isMyNeighbor(nickname1, nickname2) && isMyNeighbor(nickname2, nickname1);
    }

    // === 이웃 관계 상태 조회 (API용) ===
    // 
    // 두 사용자 간의 이웃 관계 상태 조회
    /*
        currentUserNickname: 현재 사용자 닉네임
        targetUserNickname: 대상 사용자 닉네임
        return: 관계 상태 정보
    */
    @Transactional(readOnly = true)
    public Map<String, Object> getRelationshipStatus(String currentUserNickname, String targetUserNickname) {
        boolean iAmFollowing = isMyNeighbor(currentUserNickname, targetUserNickname);
        boolean theyAreFollowing = isMyFollower(currentUserNickname, targetUserNickname);
        boolean isMutual = iAmFollowing && theyAreFollowing;

        return Map.of(
            "iAmFollowing", iAmFollowing, // 내가 상대방을 팔로우하고 있는지
            "theyAreFollowing", theyAreFollowing, // 상대방이 나를 팔로우하고 있는지
            "isMutual", isMutual, // 맞팔로우인지
            "canFollow", !iAmFollowing, // 팔로우 가능한지
            "canUnfollow", iAmFollowing // 언팔로우 가능한지
        );
    }


}