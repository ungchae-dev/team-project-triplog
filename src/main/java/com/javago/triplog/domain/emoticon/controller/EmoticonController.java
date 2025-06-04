package com.javago.triplog.domain.emoticon.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.javago.triplog.domain.emoticon.dto.StipopPackageDto;
import com.javago.triplog.domain.emoticon.service.StipopService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/emoticon") 
public class EmoticonController {

    private final StipopService stipopService;

    @GetMapping("/selected")
    public ResponseEntity<List<StipopPackageDto>> getSelectedPackages(@RequestParam("memberId") String memberId) {
        List<StipopPackageDto> result = stipopService.getSelectedEmoticonPackages(memberId);
        return ResponseEntity.ok(result);
    }
}
