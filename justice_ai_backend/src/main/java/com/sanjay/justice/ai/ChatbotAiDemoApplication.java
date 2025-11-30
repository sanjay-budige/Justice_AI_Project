package com.sanjay.justice.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;

@SpringBootApplication
public class ChatbotAiDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChatbotAiDemoApplication.class, args);
    }

    @Bean
    public ChatMemory chatMemory() {
        return new InMemoryChatMemory();
    }
}