package com.sanjay.justice.ai.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.sanjay.justice.ai.model.ChatRequest;
import com.sanjay.justice.ai.service.ChatService;

import java.util.Map;

@RestController
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody ChatRequest request) {
        // 1. Get the answer from the service
        String response = chatService.getResponse(request.getMessage());
        
        // 2. Wrap it in a Map so it becomes JSON: { "result": "The AI Answer" }
        return Map.of("result", response);
    }
}
