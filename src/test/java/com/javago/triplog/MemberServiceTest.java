package com.javago.triplog;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.javago.constant.Gender;
import com.javago.triplog.domain.member.dto.MemberFormDto;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;

@SpringBootTest
@Transactional // 해당 어노테이션 선언 시 테스트 실행 후 롤백 처리 됨. 이걸로 같은 메서드를 반복적으로 테스트 가능
public class MemberServiceTest {   

    @Autowired
    MemberService memberService;

    @Autowired
    PasswordEncoder passwordEncoder;


    /*  private char gender; // 성별(MALE: 남성, FEMALE: 여성)
    private String memberId; // 사용자 아이디
    private String name; // 사용자 이름
    private String nickname; // 닉네임
    private String email; // 이메일
    private String password; // 비밀번호
    private String passwordCheck; // 비밀번호 확인
    private String phone;
     */

    // 회원 정보를 입력한 Member 엔티티를 만드는 메서드를 작성
    public Member createMember() {
        MemberFormDto memberFormDto = new MemberFormDto();
        memberFormDto.setGender(Gender.MALE); // Gender: enum 남성(MALE), 여성(FEMALE)
        memberFormDto.setMemberId("loop1004");
        memberFormDto.setName("루피");
        memberFormDto.setNickname("쵸카와이");
        memberFormDto.setEmail("test@email.com");
        memberFormDto.setPassword("!loop1004");
        memberFormDto.setPhone("010-1004-1004");

        return Member.createMember(memberFormDto, passwordEncoder);
    }

    // Junit의 Assertions 클래스의 assertEquals 메서드를 이용해 저장하려고 했던 값과
    // 실제 저장된 데이터를 비교. 1번째 파라미터: 기대값, 2번째 파라미터: 실제 저장된 값을 넣어줌
    @Test
    @DisplayName("회원가입 테스트")
    public void saveMemberTest() {
        System.out.println("테스트 시작");
        Member member = createMember();
        Member savedMember = memberService.saveMember(member);

        assertEquals(member.getGender(), savedMember.getGender());
        assertEquals(member.getMemberId(), savedMember.getMemberId());
        assertEquals(member.getName(), savedMember.getName());
        assertEquals(member.getNickname(), savedMember.getNickname());
        assertEquals(member.getEmail(), savedMember.getEmail());
        assertEquals(member.getPassword(), savedMember.getPassword());
        assertEquals(member.getPhone(), savedMember.getPhone());
        System.out.println("테스트 종료");
    }

    @Test
    @DisplayName("관리자 비밀번호 암호화 생성")
    public void generateAdminPasswords() {
        System.out.println("=== 관리자 비밀번호 암호화 결과 ===");
        System.out.println("ucna(pw01) -> " + passwordEncoder.encode("pw01"));
        System.out.println("dyshin(pw02) -> " + passwordEncoder.encode("pw02"));
        System.out.println("smyu(pw03) -> " + passwordEncoder.encode("pw03"));
        System.out.println("mhkim(pw04) -> " + passwordEncoder.encode("pw04"));
        System.out.println("egsa(pw05) -> " + passwordEncoder.encode("pw05"));
        System.out.println("===============================");
    }
    /* 
    @Test
    @DisplayName("중복 회원가입 테스트")
    public void saveDuplicateMemberTest() {
        Member member1 = createMember();
        Member member2 = createMember();

        memberService.saveMember(member1);

        // junit의 Assertion 클래스의 assertThrows 메서드로 예외 처리 테스트 가능
        // 1번째 파라미터: 발생할 예외 타입을 삽입
        Throwable e = assertThrows(IllegalStateException.class, () -> {
            memberService.saveMember(member2);
        });

        // 발생한 예외 메시지가 예상 결과와 맞는지 검증
        assertEquals("이미 가입된 회원입니다!", e.getMessage());
    }
    */
    
}
