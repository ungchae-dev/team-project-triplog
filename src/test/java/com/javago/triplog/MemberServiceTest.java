package com.javago.triplog;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
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


    /*  private char gender; // 성별(M: 남성, F: 여성)
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
    
}
