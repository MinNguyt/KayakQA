package com.example.chatbot.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Service for calling an LLM (via OpenRouter) to extract booking features from
 * user messages.
 * Mirrors the Node.js chatbotService.ts callChatGPT logic.
 */
@Service
@Slf4j
public class LlmService {

    private static final String OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
    private static final String MODEL = "liquid/lfm-2.5-1.2b-thinking:free";

    @Value("${chatbot.openrouter-token:}")
    private String openrouterToken;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Extract booking features (departure_station, arrival_station, departure_date,
     * departure_time)
     * from a user message using the LLM.
     *
     * @return a Map with keys: departure_station, arrival_station, departure_date,
     *         departure_time
     */
    public Map<String, String> extractBookingFeatures(String userMessage) {
        // Build a single combined prompt (mirrors the working TypeScript
        // implementation)
        // This works better with free-tier models that may not follow system/user role
        // separation well
        String combinedPrompt = "Extract booking information from this Vietnamese message and return as JSON.\n" +
                "Look for:\n" +
                "- departure_station: departure city/station name (e.g., \"Hà Nội\", \"TP.HCM\")\n" +
                "- arrival_station: arrival city/station name\n" +
                "- departure_date: date in YYYY-MM-DD format (convert Vietnamese dates like \"ngày 7 tháng 10 năm 2026\" to \"2026-10-07\"), if user provides a missing year, set default to 2026\n"
                +
                "- departure_time: time in HH:MM format (24-hour format)\n" +
                "\n" +
                "Message: \"" + userMessage + "\"\n" +
                "\n" +
                "Return only valid JSON with found fields, omit missing ones.";

        try {
            // Use high max_tokens: stepfun/step-3.5-flash is a reasoning model that
            // consumes many tokens on internal <think> reasoning before emitting the
            // answer.
            // With too few tokens it exhausts the budget on reasoning and returns empty
            // content.
            Map<String, Object> requestBody = Map.of(
                    "model", MODEL,
                    "messages", List.of(
                            Map.of("role", "user", "content", combinedPrompt)),
                    "temperature", 0.1,
                    "max_tokens", 2000);

            String payload = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(OPENROUTER_ENDPOINT))
                    .header("Authorization", "Bearer " + openrouterToken)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("LLM API failed: {} {}", response.statusCode(), response.body());
                throw new RuntimeException("LLM API failed: " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode messageNode = root.path("choices").path(0).path("message");
            String content = messageNode.path("content").asText("");
            log.debug("Raw LLM response content: '{}'", content);

            // Fallback: if content is empty (reasoning model ran out of tokens for output),
            // try to extract JSON directly from the reasoning field.
            if (content.isBlank()) {
                log.warn("LLM returned empty content (finish_reason={}), trying reasoning field fallback",
                        root.path("choices").path(0).path("finish_reason").asText());
                content = messageNode.path("reasoning").asText("");
                if (content.isBlank()) {
                    // Also check reasoning_details array
                    JsonNode reasoningDetails = messageNode.path("reasoning_details");
                    if (reasoningDetails.isArray()) {
                        StringBuilder sb = new StringBuilder();
                        for (JsonNode detail : reasoningDetails) {
                            sb.append(detail.path("text").asText(""));
                        }
                        content = sb.toString();
                    }
                }
                log.debug("Using reasoning field as fallback, length={}", content.length());
            }

            // Extract JSON from potential markdown code block or thinking tags
            String jsonStr = extractJsonFromResponse(content);
            log.info("Extracted JSON string: {}", jsonStr);

            Map<String, String> features = parseBookingJson(jsonStr);
            log.info("Parsed booking features: {}", features);
            return features;
        } catch (Exception e) {
            log.error("Error calling LLM", e);
            return new HashMap<>(); // Return empty map on failure
        }
    }

    /**
     * Generate a natural language response to the user based on context.
     */
    public String generateResponse(String systemPrompt, String userMessage) {
        try {
            Map<String, Object> requestBody = Map.of(
                    "model", MODEL,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userMessage)),
                    "temperature", 0.7,
                    "max_tokens", 3000);

            String payload = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(OPENROUTER_ENDPOINT))
                    .header("Authorization", "Bearer " + openrouterToken)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("LLM API failed: {} {}", response.statusCode(), response.body());
                return "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.";
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode messageNode = root.path("choices").path(0).path("message");
            String content = messageNode.path("content").asText("");

            // Fallback: reasoning model may return empty content if token budget too low
            if (content.isBlank()) {
                content = messageNode.path("reasoning").asText("");
            }

            // Remove thinking tags if present
            return removeThinkingTags(content);
        } catch (Exception e) {
            log.error("Error generating response", e);
            return "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.";
        }
    }

    private String extractJsonFromResponse(String content) {
        // Remove <think>...</think> tags
        String cleaned = removeThinkingTags(content);

        // Try to extract JSON from markdown code block
        int jsonStart = cleaned.indexOf("```json");
        if (jsonStart >= 0) {
            int start = cleaned.indexOf("\n", jsonStart) + 1;
            int end = cleaned.indexOf("```", start);
            if (end > start) {
                return cleaned.substring(start, end).trim();
            }
        }

        // Try to find raw JSON object
        int braceStart = cleaned.indexOf("{");
        int braceEnd = cleaned.lastIndexOf("}");
        if (braceStart >= 0 && braceEnd > braceStart) {
            return cleaned.substring(braceStart, braceEnd + 1);
        }

        return cleaned.trim();
    }

    private static final Pattern THINKING_TAG_PATTERN = Pattern.compile("<think>.*?</think>", Pattern.DOTALL);

    private String removeThinkingTags(String content) {
        return THINKING_TAG_PATTERN.matcher(content).replaceAll("").trim();
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> parseBookingJson(String json) {
        Map<String, String> result = new HashMap<>();
        try {
            Map<String, Object> parsed = objectMapper.readValue(json, Map.class);
            for (Map.Entry<String, Object> entry : parsed.entrySet()) {
                String value = entry.getValue() != null ? entry.getValue().toString().trim() : "";
                if (!value.isEmpty() && !value.equals("null")) {
                    result.put(entry.getKey(), value);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse booking JSON: {}", json, e);
        }
        return result;
    }
}
