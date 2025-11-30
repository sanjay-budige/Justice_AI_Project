package com.sanjay.justice.ai.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;

@Configuration
public class PromptTemplateConfig {

    @Value("classpath:prompts/faq-system-prompt.txt")
    private Resource systemPrompt;

    @Bean
    public PromptTemplate promptTemplate() {
        return new PromptTemplate(systemPrompt);
    }
}
