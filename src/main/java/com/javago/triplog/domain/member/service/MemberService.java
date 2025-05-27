package com.javago.triplog.domain.member.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.javago.triplog.domain.member.dto.MemberFormDto;
import com.javago.triplog.domain.member.entity.Member;
import com.javago.triplog.domain.member.repository.MemberRepository;


@Service
@Transactional
public class MemberService {
    
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileUploadService fileUploadService;

    public MemberService(MemberRepository memberRepository, PasswordEncoder passwordEncoder, FileUploadService fileUploadService) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileUploadService = fileUploadService;
    }

    public Member registerMember(MemberFormDto memberFormDto) {
        
        // 주민등록번호, 닉네임, 이메일, 휴대폰 번호 중복 검사
        if (memberRepository.existsBySsn(memberFormDto.getSsn())) {
            throw new IllegalStateException("이미 등록된 주민등록번호입니다!");
        } else if (memberRepository.existsByNickname(memberFormDto.getNickname())) {
            throw new IllegalStateException("이미 등록된 닉네임입니다!");
        } else if (memberRepository.existsByEmail(memberFormDto.getEmail())) {
            throw new IllegalStateException("이미 등록된 이메일입니다!");
        } else if (memberRepository.existsByPhone(memberFormDto.getPhone())) {
            throw new IllegalStateException("이미 등록된 휴대폰 번호입니다!");
        }

        // 엔티티 생성 및 저장
        Member member = Member.createMember(memberFormDto, passwordEncoder);

        return memberRepository.save(member);
    }

    // 회원 ID로 회원 조회. 없으면 예외 발생
    public Member findMember(String memberId) {
        return memberRepository.findById(memberId)
        .orElseThrow(() -> new IllegalArgumentException("해당 회원을 찾을 수 없습니다!"));
    }

    // 회원 정보 수정
    public Member updateMember(String memberId, MemberFormDto memberFormDto) {
        
        // 회원 조회해서 없으면 예외 발생
        Member member = findMember(memberId);

        // 수정 항목: 닉네임, 이메일, 휴대폰 번호
        member.setNickname(memberFormDto.getNickname());
        member.setEmail(memberFormDto.getEmail());
        member.setPhone(memberFormDto.getPhone());

        // 프로필 이미지 파일이 있으면 처리 (업로드 서비스 호출 가정)
        if (memberFormDto.getProfileImageFile() != null && !memberFormDto.getProfileImageFile().isEmpty()) {
            // 이미지 업로드 서비스 로직 필요 ex) fileUploadService.upload() 와 같은 식
            String profileImagePath = fileUploadService.upload(memberFormDto.getProfileImageFile());
            member.setProfileImage(profileImagePath);
        }

        // 비밀번호가 새로 입력된 경우에만 비밀번호 암호화하여 업데이트
        // 비밀번호 변경이 없으면 기존 비밀번호 유지
        if (memberFormDto.getPassword() != null && !memberFormDto.getPassword().isEmpty()) {
            member.setPassword(passwordEncoder.encode(memberFormDto.getPassword()));
        }
        
        return memberRepository.save(member); // 수정된 회원 정보 저장 및 반환
    }


}
