package com.javago.triplog.domain.member.service;
/*DB에 있는 도토리에 충전한 도토리를 더해주는 서비스입니다*/
import org.springframework.stereotype.Service;

@Service
public class ChargeService {

    public void addAcorn(String memberId, int acornAmount) {
        // DB에 가서 memberId에 해당하는 사용자에게 도토리(acornAmount)만큼 더해줌

        System.out.printf("회원 %s 님에게 도토리 %d개 충전 완료!\n", memberId, acornAmount);
    }

}
