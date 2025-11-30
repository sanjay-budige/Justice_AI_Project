package com.sanjay.justice.ai.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class ChatService {

    private final ChatClient chatClient;
    private final PromptTemplate promptTemplate;

    public ChatService(ChatClient.Builder builder, ChatMemory chatMemory, PromptTemplate promptTemplate) {
        this.promptTemplate = promptTemplate;
        
        this.chatClient = builder
                // NEW CONFIGURATION:
                // 1. chatMemory: The storage (RAM)
                // 2. "default": The conversation ID
                // 3. 10: The Memory Size (Only sends the last 10 messages to Groq)
                .defaultAdvisors(new MessageChatMemoryAdvisor(chatMemory, "default", 10))
                .build();
    }

    public String getResponse(String userInput) {
        // Render the system prompt with the user's input
        String systemSpec = promptTemplate.render(Map.of("input", userInput));

        return chatClient.prompt()
                .user(systemSpec)
                .call()
                .content();
    }
}