package com.example.chatbot.application;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for detecting user intent using embedding cosine similarity.
 * Mirrors the Node.js chatbotService.ts intent detection logic.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class IntentDetectionService {

    private final EmbeddingService embeddingService;

    // Predefined intents with their descriptions (matching Node.js chatbot)
    private static final Map<String, String> INTENT_DESCRIPTIONS = new LinkedHashMap<>() {
        {
            put("greeting", "xin chào, hello, chào bạn, hi, hey");
            put("book_ticket", "tôi muốn đặt vé xe, mua vé, book vé xe khách, đặt chỗ xe");
            put("check_schedule", "xem lịch trình, kiểm tra chuyến xe, có chuyến nào không, lịch xe chạy");
            put("collect_information", "đi từ đâu đến đâu, ngày nào, mấy giờ, bao nhiêu người, thông tin chuyến đi");
            put("other", "hỏi thông tin khác, giúp đỡ, hỗ trợ, câu hỏi chung");
        }
    };

    // Cached intent embeddings
    private Map<String, List<Double>> intentEmbeddings;

    @PostConstruct
    public void initIntentEmbeddings() {
        try {
            intentEmbeddings = new LinkedHashMap<>();
            for (Map.Entry<String, String> entry : INTENT_DESCRIPTIONS.entrySet()) {
                List<Double> embedding = embeddingService.embed(entry.getValue());
                intentEmbeddings.put(entry.getKey(), embedding);
                log.info("Loaded intent embedding for: {}", entry.getKey());
            }
            log.info("All {} intent embeddings loaded successfully", intentEmbeddings.size());
        } catch (Exception e) {
            log.error("Failed to load intent embeddings. Intent detection will use fallback.", e);
            intentEmbeddings = new LinkedHashMap<>();
        }
    }

    /**
     * Detect intent from a user message by comparing its embedding
     * against pre-computed intent embeddings using cosine similarity.
     *
     * @return the detected intent name (e.g., "greeting", "book_ticket", etc.)
     */
    public String detectIntent(String userMessage) {
        if (intentEmbeddings == null || intentEmbeddings.isEmpty()) {
            log.warn("Intent embeddings not loaded, using keyword fallback");
            return detectIntentByKeyword(userMessage);
        }

        try {
            List<Double> messageEmbedding = embeddingService.embed(userMessage);
            String bestIntent = "other";
            double bestSimilarity = -1;

            for (Map.Entry<String, List<Double>> entry : intentEmbeddings.entrySet()) {
                double similarity = EmbeddingService.cosineSimilarity(messageEmbedding, entry.getValue());
                log.debug("Intent '{}' similarity: {}", entry.getKey(), similarity);
                if (similarity > bestSimilarity) {
                    bestSimilarity = similarity;
                    bestIntent = entry.getKey();
                }
            }

            log.info("Detected intent: {} (similarity: {})", bestIntent, bestSimilarity);
            return bestIntent;
        } catch (Exception e) {
            log.error("Error detecting intent via embedding, using keyword fallback", e);
            return detectIntentByKeyword(userMessage);
        }
    }

    /**
     * Detect intent from the message embedding directly (when embedding is already
     * computed).
     */
    public String detectIntent(List<Double> messageEmbedding) {
        if (intentEmbeddings == null || intentEmbeddings.isEmpty()) {
            return "other";
        }

        String bestIntent = "other";
        double bestSimilarity = -1;

        for (Map.Entry<String, List<Double>> entry : intentEmbeddings.entrySet()) {
            double similarity = EmbeddingService.cosineSimilarity(messageEmbedding, entry.getValue());
            if (similarity > bestSimilarity) {
                bestSimilarity = similarity;
                bestIntent = entry.getKey();
            }
        }

        return bestIntent;
    }

    /**
     * Keyword-based fallback for intent detection.
     */
    private String detectIntentByKeyword(String message) {
        String lower = message.toLowerCase();

        if (lower.matches(".*(xin chào|hello|hi|hey|chào).*")) {
            return "greeting";
        }
        if (lower.matches(".*(đặt vé|mua vé|book|đặt chỗ).*")) {
            return "book_ticket";
        }
        if (lower.matches(".*(lịch trình|chuyến xe|lịch xe|xem chuyến).*")) {
            return "check_schedule";
        }
        if (lower.matches(".*(đi từ|đến|ngày|giờ|từ .* đến).*")) {
            return "collect_information";
        }
        return "other";
    }
}
