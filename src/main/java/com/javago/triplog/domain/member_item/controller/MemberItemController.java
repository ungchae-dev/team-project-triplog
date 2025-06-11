package com.javago.triplog.domain.member_item.controller;

import com.javago.triplog.domain.member_item.service.MemberItemService;
import com.javago.triplog.domain.emoticon.dto.EmoticonDto;
import com.javago.triplog.domain.music.dto.MusicDto;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile/items")
@RequiredArgsConstructor
public class MemberItemController {

    private final MemberItemService memberItemService;

    // 이모티콘 보유 내역
    @GetMapping("/emoticons")
    public List<EmoticonDto> getOwnedEmoticons(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        String memberId = userDetails.getUsername();
        return memberItemService.getOwnedEmoticons(memberId);
    }

    // 음악 보유 내역
    @GetMapping("/music")
    public List<MusicDto> getOwnedMusic(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        String memberId = userDetails.getUsername();
        return memberItemService.getOwnedMusic(memberId);
    }
}