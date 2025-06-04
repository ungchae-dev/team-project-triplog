package com.javago.triplog.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.javago.triplog.domain.member.dto.MemberFormDto;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.service.MemberService;

// application 시작 시 초기 데이터를 자동으로 생성하는 설정 클래스
// 관리자(ADMIN) 계정들을 자동 생성하여 기존 INSERT INTO member 작업 대체
// yml 파일에서 관리자 정보를 읽어와서 생성
@Component
public class InitialDataConfig implements ApplicationRunner {
    
    // 회원 관련 비즈니스 로직을 처리하는 서비스
    @Autowired
    private MemberService memberService;

    // 비밀번호 암호화를 위한 인코더 (Spring Security 제공)
    @Autowired
    private PasswordEncoder passwordEncoder;

    // yml 파일의 관리자 설정 정보를 담은 Properties 클래스
    @Autowired
    private AdminConfigProperties adminConfig;

    // 애플리케이션 시작 후 자동 실행되는 메서드
    // ApplicationRunner 인터페이스의 구현 메서드
    // args : 애플리케이션 실행 시 전달된 인수들
    @Override
    public void run(ApplicationArguments args) throws Exception {
        createInitialAdmins();
    }

    // 초기 관리자 계정들을 생성하는 메서드
    // yml 파일에서 설정된 관리자 목록을 순회하며 계정 생성
    private void createInitialAdmins() {
        System.out.println("초기 관리자 계정 생성 시작...");

        // yml에서 설정된 관리자 계정 목록 순회
        for (AdminConfigProperties.AdminAccount adminAccount : adminConfig.getAccounts()) {
            createAdminIfNotExists(adminAccount);
        }
        
        System.out.println("초기 관리자 계정 생성 완료!");
    }

    // 관리자 계정이 존재하지 않을 경우 새로 생성하는 메서드
    // 중복 생성을 방지하여 애플리케이션을 여러 번 실행해도 안전함
    // 관리자 계정 ID, 이름, 닉네임, 비밀번호(평문으로 입력, 자동으로 암호화)
    private void createAdminIfNotExists(AdminConfigProperties.AdminAccount adminAccount) {
        
        // 이미 존재하는 아이디인지 확인
        if (!memberService.existsByMemberId(adminAccount.getId())) {
            MemberFormDto memberFormDto = new MemberFormDto();
            memberFormDto.setMemberId(adminAccount.getId()); // ID
            memberFormDto.setName(adminAccount.getName()); // 이름
            memberFormDto.setGender(adminAccount.getGender()); // 성별 (yml에서 설정)
            memberFormDto.setNickname(adminAccount.getNickname()); // 닉네임
            memberFormDto.setEmail(adminAccount.getId() + "@triplog.com"); // 이메일 (ID + 도메인)
            memberFormDto.setPassword(adminAccount.getPassword()); // 비밀번호 (자동 암호화)
            memberFormDto.setProfileImageFile(null); // 프로필 이미지 기본값: null
            memberFormDto.setPhone(adminAccount.getPhone()); // 전화번호
            // role: Member.createMember()에서 기본값으로 ADMIN 설정되어야 함
            // acorn, join_date는 Entity에서 기본값 설정

            // Member 엔티티 생성 (여기서 비밀번호 자동으로 암호화)
            Member admin = Member.createAdmin(memberFormDto, passwordEncoder);

            // DB에 관리자 계정 저장
            memberService.saveMember(admin);

            System.out.println("관리자 계정 생성: " + adminAccount.getId() + " (" + adminAccount.getName() + ")");
        } else {
            System.out.println("관리자 계정 이미 존재: " + adminAccount.getId());
        }
    }

}
