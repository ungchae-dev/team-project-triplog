package com.javago.triplog.domain.member.entity;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.javago.constant.Gender;
import com.javago.constant.Role;
import com.javago.triplog.domain.blog.entity.Blog;
import com.javago.triplog.domain.comment_like.entity.Comment_Like;
import com.javago.triplog.domain.comments.entity.Comments;
import com.javago.triplog.domain.guestbook.entity.Guestbook;
import com.javago.triplog.domain.member.dto.MemberFormDto;
import com.javago.triplog.domain.member_item.entity.MemberItem;
import com.javago.triplog.domain.neighbor.entity.Neighbor;
import com.javago.triplog.domain.post_like.entity.Post_Like;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "member")
@Getter
@Setter
@ToString
public class Member {
    
    // 오라클 DB 회원 테이블(member) 연동하여 코드 작성

    // @Column의 unique = true?
    // 주민번호, 닉네임, 이메일, 휴대폰 번호를 유일하게 구분하기 위해
    // 중복된 값이 DB에 들어올 수 없게 unique 속성 지정
    @Id
    @Column(name = "member_id", length = 20, nullable = false)
    private String memberId; // 사용자 아이디(PK)

    @Column(name = "name", length = 20, nullable = false)
    private String name;      // 사용자 실명

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10, nullable = false)
    private Gender gender;      // 성별 (MALE: 남성 / FEMALE: 여성)

    @Column(name = "nickname", length = 50, nullable = false, unique = true)
    private String nickname;  // 닉네임 (다른 사용자에게 표시됨)

    @Column(name = "email", length = 30, nullable = false, unique = true)
    private String email;     // 이메일 (@ 포함)

    @Column(name = "password", length = 100, nullable = false)
    private String password;  // 비밀번호 (특수문자, 영문, 숫자 포함)

    @Column(name = "profile_image")
    private String profileImage;  // 프로필 이미지 경로 (NULL 허용)

    @Column(name = "phone", length = 20, nullable = false, unique = true)
    private String phone;     // 휴대폰 번호 (ex: 010-1234-5678)

    @Column(name = "join_date", length = 8, nullable = false)
    private String joinDate;    // 가입일자

    @Column(name = "acorn", nullable = false)
    private int acorn;        // 도토리 (기본값: 30)

    // 자바의 enum 타입을 엔티티 속성으로 지정 가능
    // Enum 사용 시, 기본적으로 순서 저장됨.
    // enum의 순서가 바뀔 경우 문제 발생할 수 있어 "EnumType.STRING" 옵션을 통해
    // String으로 저장 권장
    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 10, nullable = false)
    private Role role;

    // === 모든 컬렉션 필드에 @JsonIgnore 추가 ===
    // Member 객체를 JSON으로 변환할 때 모든 관련 엔티티들을 함께 직렬화하려고 시도
    // => 무한 참조로 인해 1001 depth 에러 발생하므로 따라서 @JsonIgnore 어노테이션 추가

    // Member -> Blog (1:1)
    @JsonIgnore
    @OneToOne(mappedBy = "member", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Blog blog;
    // JPA는 양방향 관계에서 한쪽만 연관관계 주인이 되어야 함
    // 연관관계 주인: FK를 관리하는 쪽
    // • mappedBy = "member" : 상대방 엔티티의 member 필드가 주인임.
    // • cascade = CascadeType.ALL: 내가 변경되면 연관된 엔티티도 같이 변경하는 것
    // • fetch = FetchType.LAZY: 필요할 때만 데이터를 가져옴(지연 로딩)
    //  LAZY: 지연 로딩, 필요할 때 DB에서 조회 => 메모리 절약, 필요한 것만 조회
    //  EAGER: 즉시 로딩, 항상 함께 조회 => 한 번에 조회하지만 불필요한 데이터까지 가져올 수 있음

    // Member -> MemberItem (1:다)
    @JsonIgnore
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<MemberItem> memberItems = new ArrayList<>();

    // Member -> Post_Like (1:다)
    @JsonIgnore
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Post_Like> postLike = new ArrayList<>();

    // Member -> Comment_Like (1:다)
    @JsonIgnore
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Comment_Like> commentLike = new ArrayList<>();

    // Member -> Comments (1:다)
    @JsonIgnore
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Comments> comment = new ArrayList<>();

    // Member -> Guestbook (1:다) - 내가 작성한 방명록들
    @JsonIgnore
    @OneToMany(mappedBy = "writer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Guestbook> writtenGuestbooks = new ArrayList<>();

    // Member -> Neighbor (1:다) - 내가 등록한 이웃들 (내가 팔로우한 사람들)
    // orphanRemoval = true: 부모 엔티티와의 관계가 끊어진 자식 엔티티(고아 객체)를 자동으로 삭제하는 기능
    @JsonIgnore
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Neighbor> myNeighbors = new ArrayList<>();

    // Member -> Neighbor (1:다) - 나를 이웃으로 등록한 사람들 (나를 팔로우한 사람들)
    @JsonIgnore
    @OneToMany(mappedBy = "neighborMember", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Neighbor> followersOfMe = new ArrayList<>();

    // 생성 직전 기본값 세팅 (joinDate, acorn)
    @PrePersist
    public void prePersist() {
        if (joinDate == null) {
            joinDate = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));  // 현재 날짜 세팅
        }
        if (acorn == 0) {
            acorn = 30;  // 기본 도토리 30으로 세팅
        }
    }

    // 기본 생성자 (JPA용)
    public Member() {}

    // Member 엔티티를 생성하는 메서드 (회원 생성)
    public static Member createMember(MemberFormDto memberFormDto, PasswordEncoder passwordEncoder) {
        
        Member member = new Member();

        member.setMemberId(memberFormDto.getMemberId());
        member.setName(memberFormDto.getName());
        member.setGender(memberFormDto.getGender());
        member.setNickname(memberFormDto.getNickname());
        member.setEmail(memberFormDto.getEmail());
        member.setPhone(memberFormDto.getPhone());
        // profileImage의 경우 

        // spring security 설정 클래스(SecurityConfig)에 등록한 
        // BCryptPasswordEncoder Bean을 파라미터로 넘겨 비밀번호를 암호화
        // 비밀번호 암호화 후 저장
        String password = passwordEncoder.encode(memberFormDto.getPassword());
        member.setPassword(password);
        member.setRole(Role.USER); // 기본 권한: 블로그 사용자

        // 프로필 이미지는 회원가입 시점엔 NULL (나중에 블로그 프로필에서 업로드)
        member.setProfileImage(null);

        return member;
    }

    // 관리자 생성 메서드
    public static Member createAdmin(MemberFormDto memberFormDto, PasswordEncoder passwordEncoder) {
        Member member = createMember(memberFormDto, passwordEncoder);
        member.setRole(Role.ADMIN); // 관리자 권한 설정
        return member;
    }

    // === 양방향 관계 편의 메서드들 ===

    // === 회원 아이템 (음악, 이모티콘) ===
    public void addMemberItem(MemberItem memberItem) {
        memberItems.add(memberItem);
        memberItem.setMember(this);
    }

    public void removeMemberItem(MemberItem memberItem) {
        memberItems.remove(memberItem);
        memberItem.setMember(null);
    }

    // === 방명록 ===
    public void addWrittenGuestbook(Guestbook guestbook) {
        writtenGuestbooks.add(guestbook);
        guestbook.setWriter(this);
    }

    public void removeWrittenGuestbook(Guestbook guestbook) {
        writtenGuestbooks.remove(guestbook);
        guestbook.setWriter(null);
    }
    
    // === 이웃 ===

    // 이웃 추가
    public void addNeighbor(Member neighborMember) {
        Neighbor neighbor = Neighbor.builder()
            .member(this)
            .neighborMember(neighborMember)
            .build();
        myNeighbors.add(neighbor);
    }

    // 이웃 제거
    public void removeNeighbor(Member neighborMember) {
        myNeighbors.removeIf(neighbor -> 
            neighbor.getNeighborMember().getMemberId().equals(neighborMember.getMemberId()));
    }

    // 특정 회원이 내 이웃인지 확인 (내가 팔로우했는지)
    public boolean isMyNeighbor(String memberId) {
        return myNeighbors.stream()
            .anyMatch(neighbor -> neighbor.getNeighborMember().getMemberId().equals(memberId));
    }

    // 특정 회원이 나를 이웃으로 등록했는지 확인 (상대방이 나를 팔로우했는지)
    public boolean isFollowerOfMe(String memberId) {
        return followersOfMe.stream()
            .anyMatch(follower -> follower.getMember().getMemberId().equals(memberId));
    }

    // 내 이웃 수 (내가 팔로우한 사람 수)
    public int getMyNeighborCount() {
        return myNeighbors.size();
    }

    // 나를 팔로우한 사람 수
    public int getFollowerCount() {
        return followersOfMe.size();
    }

    // 서로 이웃인지 확인 (맞팔로우)
    public boolean isMutualNeighbor(String memberId) {
        return isMyNeighbor(memberId) && isFollowerOfMe(memberId);
    }

    // 내가 등록한 이웃들의 닉네임 목록
    public List<String> getMyNeighborNicknames() {
        return myNeighbors.stream()
            .map(neighbor -> neighbor.getNeighborMember().getNickname())
            .sorted()
            .toList();
    }

    // 나를 팔로우한 사람들의 닉네임 목록
    public List<String> getFollowerNicknames() {
        return followersOfMe.stream()
            .map(follower -> follower.getMember().getNickname())
            .sorted()
            .toList();
    }


}