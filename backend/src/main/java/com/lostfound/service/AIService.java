package com.lostfound.service;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.File;

@Service
public class AIService {

    private final WebClient webClient =
            WebClient.create("http://localhost:5000");

    public String callAI(
            File lostImage,
            File foundImage,
            String lostDescription,
            String foundDescription) {

        MultipartBodyBuilder builder = new MultipartBodyBuilder();

        builder.part("lost_image",
                new FileSystemResource(lostImage));

        builder.part("found_image",
                new FileSystemResource(foundImage));

        builder.part("lost_description", lostDescription);
        builder.part("found_description", foundDescription);

        Mono<String> response = webClient.post()
                .uri("/matchAI")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(String.class);

        return response.block(); // waits for AI response
    }
}