package com.nexus.campus.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.boot.web.client.ClientHttpRequestFactories;
import org.springframework.boot.web.client.ClientHttpRequestFactorySettings;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Slf4j
@Component
public class LlmClient {

    private final RestClient restClient;
    private final String model;
    private final ObjectMapper objectMapper;

    public LlmClient(
            @Value("${campus.ai.llm.endpoint}") String endpoint,
            @Value("${campus.ai.llm.api-key:}") String apiKey,
            @Value("${campus.ai.llm.model}") String model,
            @Value("${campus.ai.llm.timeout}") Duration timeout) {
        this.model = model;
        this.objectMapper = new ObjectMapper();
        ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings.DEFAULTS
                .withConnectTimeout(timeout)
                .withReadTimeout(timeout);
        this.restClient = RestClient.builder()
                .baseUrl(endpoint)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .requestFactory(ClientHttpRequestFactories.get(settings))
                .build();
    }

    /**
     * Sends a chat completion request to the OpenAI-compatible API.
     *
     * @param systemPrompt system-level instruction
     * @param userContent  user message content
     * @return the assistant's response text, or null on failure
     */
    public String chatCompletion(String systemPrompt, String userContent) {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", model);

            ArrayNode messages = requestBody.putArray("messages");
            ObjectNode systemMsg = messages.addObject();
            systemMsg.put("role", "system");
            systemMsg.put("content", systemPrompt);
            ObjectNode userMsg = messages.addObject();
            userMsg.put("role", "user");
            userMsg.put("content", userContent);

            String json = objectMapper.writeValueAsString(requestBody);

            String response = restClient.post()
                    .uri("/chat/completions")
                    .body(json)
                    .retrieve()
                    .body(String.class);

            if (response == null || response.isBlank()) {
                log.warn("LLM response was empty");
                return null;
            }

            JsonNode root = objectMapper.readTree(response);
            String text = root.path("choices").path(0).path("message").path("content").asText(null);
            if (text == null) {
                log.warn("LLM response missing expected content path: {}", response);
            }
            return text;

        } catch (Exception e) {
            log.warn("LLM chat completion failed: {}", e.getMessage());
            return null;
        }
    }
}
