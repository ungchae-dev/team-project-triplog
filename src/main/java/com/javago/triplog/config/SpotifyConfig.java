package com.javago.triplog.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;
import lombok.Setter;

@Configuration
@ConfigurationProperties(prefix = "spotify") // application.yml 파일에서 "spotify.client-id"와 "spotify.client-secret"을 읽어옵니다.
@Getter
@Setter
public class SpotifyConfig {
    private String clientId;
    private String clientSecret;

}