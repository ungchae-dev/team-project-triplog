package com.javago.triplog.domain.neighbor.entity;

import com.javago.triplog.domain.member.entity.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "neighbor", 
    uniqueConstraints = @UniqueConstraint(columnNames = {"member_id", "neighbor_member_id"}))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Neighbor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "neighbor_seq")
    @SequenceGenerator(
        name = "neighbor_seq",
        sequenceName = "neighbor_seq", 
        allocationSize = 1
    )
    @Column(name = "neighbor_id")
    private Long neighborId;

    // 이웃을 등록한 사용자 (N:1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    // 이웃으로 등록된 사용자 (N:1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "neighbor_member_id", nullable = false)
    private Member neighborMember;

    // 자기 자신 등록 검증 메서드
    private void validateNotSelfRegistration(Member member, Member neighborMember) {
        if (member != null && neighborMember != null && 
            member.getMemberId().equals(neighborMember.getMemberId())) {
            throw new IllegalArgumentException("자기 자신을 이웃으로 등록할 수 없습니다!");
        }
    }

    // === JPA 생명주기 콜백 - 자기 자신 등록 방지 ===
    @PrePersist
    @PreUpdate
    public void validateBeforeSave() {
        validateNotSelfRegistration(this.member, this.neighborMember); // 자기 자신 등록 검증
    }

    // === 빌더 패턴 ===
    @Builder
    public Neighbor(Member member, Member neighborMember) {
        validateNotSelfRegistration(member, neighborMember);
        this.member = member;
        this.neighborMember = neighborMember;
    }

    // === 비즈니스 메서드 ===
    
    // 특정 회원이 등록한 이웃 관계인지 확인 
    public boolean isRegisteredBy(String memberId) {
        return this.member != null && this.member.getMemberId().equals(memberId);
    }

    // 특정 회원이 이웃으로 등록된 관계인지 확인
    public boolean isNeighborOf(String memberId) {
        return this.neighborMember != null && this.neighborMember.getMemberId().equals(memberId);
    }

    // 이웃 관계가 특정 두 회원 간의 관계인지 확인
    public boolean isBetween(String memberAId, String memberBId) {
        return (isRegisteredBy(memberAId)) && (isRegisteredBy(memberBId)) || 
            (isRegisteredBy(memberBId)) && (isRegisteredBy(memberAId));
    }

    // 이웃 등록자와 이웃으로 등록된 사람이 같은지 확인 (자기 자신 등록 방지)
    public boolean isSelfRegistration() {
        return this.member != null && this.neighborMember != null && 
            this.member.getMemberId().equals(this.neighborMember.getMemberId());
    }

    // 이웃 관계 정보 요약
    public String getRelationshipSummary() {
        if (member == null || neighborMember == null) {
            return "잘못된 이웃 관계";
        }
        return String.format("[%s]님이 [%s]님을 이웃으로 등록", 
            member.getNickname(), neighborMember.getNickname());
    }


}
