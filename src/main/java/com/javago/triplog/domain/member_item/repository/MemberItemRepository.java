package com.javago.triplog.domain.member_item.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.javago.triplog.domain.member_item.entity.MemberItem;

import java.util.List;

public interface MemberItemRepository extends JpaRepository<MemberItem, Long> {

    // 사용자 ID로 구매한 아이템 전체 조회
    List<MemberItem> findByMemberId(String memberId);

    // 사용자 ID와 아이템 타입으로 조회 (ex: MUSIC만 보기)
    List<MemberItem> findByMemberIdAndItemType(String memberId, String itemType);

    // 중복 구매 방지용: 특정 유저가 특정 아이템을 이미 구매했는지 확인
    boolean existsByMemberIdAndItemId(String memberId, Long itemId);
}