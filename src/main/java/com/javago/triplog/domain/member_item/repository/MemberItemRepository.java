package com.javago.triplog.domain.member_item.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.javago.constant.ItemType;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member_item.entity.MemberItem;
import com.javago.triplog.domain.music.entity.Music;

import java.util.List;

public interface MemberItemRepository extends JpaRepository<MemberItem, Long> {

    // 1. 특정 회원이 구매한 전체 아이템 조회
    List<MemberItem> findByMember(Member member);

    // 2. 특정 회원이 구매한 특정 타입의 아이템 조회 (예: 음악만, 이모티콘만)
    List<MemberItem> findByMemberAndItemType(Member member, ItemType itemType); // ✅ 새로 추가됨

    // 3. 특정 회원이 구매한 특정 타입의 아이템 조회 (memberId로 조회할 때)
    @Query("SELECT mi FROM MemberItem mi WHERE mi.member.memberId = :memberId AND mi.itemType = :itemType")
    List<MemberItem> findByMemberIdAndItemType(@Param("memberId") String memberId, @Param("itemType") ItemType itemType);

    // 4. 특정 회원이 특정 음악을 구매했는지 여부 확인
    boolean existsByMemberAndMusicAndItemType(Member member, Music music, ItemType itemType);

    // 5. 특정 회원이 구매한 음악 ID 리스트 반환
    @Query("SELECT mi.music.musicId FROM MemberItem mi WHERE mi.member.memberId = :memberId AND mi.itemType = :itemType")
    List<Long> findMusicItemIdsByMemberIdAndItemType(@Param("memberId") String memberId, @Param("itemType") ItemType itemType);

    // 6. 특정 회원이 특정 이모티콘을 구매했는지 여부 확인
    boolean existsByMemberAndEmoticon_EmoticonId(Member member, Long emoticonId);

    // 7. 한달 간 item_type 별로 구매량 총계를 반환
    @Query(value = "SELECT SUBSTR(purchase_date, 1, 6) AS month, item_type, COUNT(*) " +
            "FROM member_item " +
            "GROUP BY SUBSTR(purchase_date, 1, 6), item_type " +
            "ORDER BY month", nativeQuery = true)
    List<Object[]> findMonthlyPurchaseStats();
}