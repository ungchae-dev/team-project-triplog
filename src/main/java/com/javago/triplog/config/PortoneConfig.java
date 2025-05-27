package com.javago.triplog.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "portone") // application.yml 파일에서 key 받아옴
public class PortoneConfig {

    private String impKey;
    private String impSecret;
    private String storeId;
    private String channelKey;
}