package com.example.fleet.infrastructure.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class EmbeddingService {

    private static final String HF_ENDPOINT = "https://router.huggingface.co/hf-inference/models/intfloat/multilingual-e5-large/pipeline/feature-extraction";

    @Value("${chatbot.hf-token:}")
    private String hfToken;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Double> embed(String text) {
        return embed(text, true);
    }

    public List<Double> embed(String text, boolean normalize) {
        try {
            String payload = objectMapper.writeValueAsString(Map.of("inputs", text));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(HF_ENDPOINT))
                    .header("Authorization", "Bearer " + hfToken)
                    .header("Accept", "application/json")
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new RuntimeException("Embedding API failed: " + response.statusCode());
            }
            Object body = objectMapper.readValue(response.body(), Object.class);
            List<Double> vector = toSentenceVector(body);
            return normalize ? l2Normalize(vector) : vector;
        } catch (Exception e) {
            log.error("Error generating embedding", e);
            throw new RuntimeException("Failed to generate embedding", e);
        }
    }

    public String toJson(List<Double> vector) {
        try {
            return objectMapper.writeValueAsString(vector);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize embedding", e);
        }
    }

    @SuppressWarnings("unchecked")
    public List<Double> fromJson(String json) {
        if (json == null || json.isEmpty())
            return null;
        try {
            List<Number> raw = objectMapper.readValue(json, List.class);
            return raw.stream().map(Number::doubleValue).toList();
        } catch (Exception e) {
            log.warn("Failed to parse embedding JSON", e);
            return null;
        }
    }

    public static double cosineSimilarity(List<Double> vecA, List<Double> vecB) {
        if (vecA == null || vecB == null)
            return 0.0;
        int len = Math.min(vecA.size(), vecB.size());
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < len; i++) {
            double a = vecA.get(i), b = vecB.get(i);
            dot += a * b;
            normA += a * a;
            normB += b * b;
        }
        double denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom == 0 ? 0 : dot / denom;
    }

    @SuppressWarnings("unchecked")
    private List<Double> toSentenceVector(Object embedding) {
        if (!(embedding instanceof List<?> list) || list.isEmpty()) {
            throw new RuntimeException("Empty or invalid embedding response.");
        }
        Object first = list.get(0);
        if (first instanceof Number) {
            return ((List<Number>) list).stream().map(Number::doubleValue).toList();
        }
        if (first instanceof List) {
            return meanPool((List<List<Number>>) list);
        }
        throw new RuntimeException("Unrecognized embedding shape.");
    }

    private List<Double> meanPool(List<List<Number>> tokenEmbeddings) {
        int tokenCount = tokenEmbeddings.size();
        if (tokenCount == 0)
            return new ArrayList<>();
        int dim = tokenEmbeddings.get(0).size();
        double[] sums = new double[dim];
        for (List<Number> tokenVector : tokenEmbeddings) {
            for (int i = 0; i < dim; i++)
                sums[i] += tokenVector.get(i).doubleValue();
        }
        List<Double> result = new ArrayList<>(dim);
        for (int i = 0; i < dim; i++)
            result.add(sums[i] / Math.max(1, tokenCount));
        return result;
    }

    private List<Double> l2Normalize(List<Double> vector) {
        double norm = 0;
        for (double v : vector)
            norm += v * v;
        norm = Math.sqrt(norm);
        if (norm <= 0)
            return vector;
        double finalNorm = norm;
        return vector.stream().map(v -> v / finalNorm).toList();
    }
}
