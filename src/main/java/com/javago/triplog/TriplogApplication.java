package com.javago.triplog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class TriplogApplication {

	public static void main(String[] args) {
		SpringApplication.run(TriplogApplication.class, args);
	}

}
