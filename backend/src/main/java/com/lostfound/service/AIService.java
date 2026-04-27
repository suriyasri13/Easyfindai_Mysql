package com.lostfound.service;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import java.io.File;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
public class AIService {

    private final WebClient webClient;

    @org.springframework.beans.factory.annotation.Autowired
    public AIService(@org.springframework.beans.factory.annotation.Value("${AI_SERVER_URL:http://localhost:5000}") String aiServerUrl) {
        // Set a 10-second connect + read timeout so we never hang if Python AI is offline
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000)
                .responseTimeout(Duration.ofSeconds(10))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(10, TimeUnit.SECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(10, TimeUnit.SECONDS)));

        this.webClient = WebClient.builder()
                .baseUrl(aiServerUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }

    public String callAI(
            File lostImage,
            File foundImage,
            String lostDescription,
            String foundDescription) {

        MultipartBodyBuilder builder = new MultipartBodyBuilder();

        if (lostImage != null && lostImage.exists()) {
            builder.part("lost_image", new FileSystemResource(lostImage));
        }
        if (foundImage != null && foundImage.exists()) {
            builder.part("found_image", new FileSystemResource(foundImage));
        }

        builder.part("lost_description", lostDescription != null ? lostDescription : "");
        builder.part("found_description", foundDescription != null ? foundDescription : "");

        // block() with a 10-second timeout — if AI is offline, throws and falls back to text-similarity
        return webClient.post()
                .uri("/matchAI")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(10))
                .block();
    }
}
