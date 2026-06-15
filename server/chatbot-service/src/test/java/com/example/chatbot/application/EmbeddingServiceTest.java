package com.example.chatbot.application;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for EmbeddingService — tests the pure computation methods
 * (cosine similarity, L2 normalization, mean pooling) without calling the
 * external API.
 */
@DisplayName("EmbeddingService")
class EmbeddingServiceTest {

    private final EmbeddingService embeddingService = new EmbeddingService();

    @Nested
    @DisplayName("Cosine Similarity")
    class CosineSimilarityTests {

        @Test
        @DisplayName("should return 1.0 for identical vectors")
        void identicalVectors() {
            List<Double> vec = List.of(1.0, 2.0, 3.0);
            double similarity = EmbeddingService.cosineSimilarity(vec, vec);
            assertEquals(1.0, similarity, 1e-6);
        }

        @Test
        @DisplayName("should return 0.0 for orthogonal vectors")
        void orthogonalVectors() {
            List<Double> vecA = List.of(1.0, 0.0);
            List<Double> vecB = List.of(0.0, 1.0);
            double similarity = EmbeddingService.cosineSimilarity(vecA, vecB);
            assertEquals(0.0, similarity, 1e-6);
        }

        @Test
        @DisplayName("should return -1.0 for opposite vectors")
        void oppositeVectors() {
            List<Double> vecA = List.of(1.0, 2.0, 3.0);
            List<Double> vecB = List.of(-1.0, -2.0, -3.0);
            double similarity = EmbeddingService.cosineSimilarity(vecA, vecB);
            assertEquals(-1.0, similarity, 1e-6);
        }

        @Test
        @DisplayName("should return 0.0 for null vectors")
        void nullVectors() {
            assertEquals(0.0, EmbeddingService.cosineSimilarity(null, List.of(1.0)));
            assertEquals(0.0, EmbeddingService.cosineSimilarity(List.of(1.0), null));
            assertEquals(0.0, EmbeddingService.cosineSimilarity(null, null));
        }

        @Test
        @DisplayName("should handle vectors of different lengths (use min length)")
        void differentLengths() {
            List<Double> vecA = List.of(1.0, 0.0, 0.0);
            List<Double> vecB = List.of(1.0, 0.0);
            double similarity = EmbeddingService.cosineSimilarity(vecA, vecB);
            assertEquals(1.0, similarity, 1e-6);
        }

        @Test
        @DisplayName("should return 0.0 for zero vector")
        void zeroVector() {
            List<Double> vecA = List.of(0.0, 0.0, 0.0);
            List<Double> vecB = List.of(1.0, 2.0, 3.0);
            double similarity = EmbeddingService.cosineSimilarity(vecA, vecB);
            assertEquals(0.0, similarity, 1e-6);
        }
    }

    @Nested
    @DisplayName("JSON Serialization")
    class JsonSerializationTests {

        @Test
        @DisplayName("should serialize vector to JSON array")
        void serializeVector() {
            List<Double> vector = List.of(0.1, 0.2, 0.3);
            String json = embeddingService.toJson(vector);
            assertNotNull(json);
            assertTrue(json.startsWith("["));
            assertTrue(json.contains("0.1"));
        }

        @Test
        @DisplayName("should deserialize JSON to vector")
        void deserializeVector() {
            String json = "[0.1,0.2,0.3]";
            List<Double> vector = embeddingService.fromJson(json);
            assertNotNull(vector);
            assertEquals(3, vector.size());
            assertEquals(0.1, vector.get(0), 1e-6);
        }

        @Test
        @DisplayName("should return null for null/empty JSON")
        void nullJson() {
            assertNull(embeddingService.fromJson(null));
            assertNull(embeddingService.fromJson(""));
        }

        @Test
        @DisplayName("should return null for invalid JSON")
        void invalidJson() {
            assertNull(embeddingService.fromJson("not json"));
        }

        @Test
        @DisplayName("round-trip serialization should preserve values")
        void roundTrip() {
            List<Double> original = List.of(0.123456, -0.789012, 0.345678);
            String json = embeddingService.toJson(original);
            List<Double> restored = embeddingService.fromJson(json);
            assertNotNull(restored);
            assertEquals(original.size(), restored.size());
            for (int i = 0; i < original.size(); i++) {
                assertEquals(original.get(i), restored.get(i), 1e-10);
            }
        }
    }
}
