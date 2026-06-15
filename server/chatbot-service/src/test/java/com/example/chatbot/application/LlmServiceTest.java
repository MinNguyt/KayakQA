package com.example.chatbot.application;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for LlmService — tests JSON extraction and parsing logic
 * without calling the external API.
 */
@DisplayName("LlmService")
class LlmServiceTest {

    private final LlmService llmService = new LlmService();

    @Nested
    @DisplayName("JSON Extraction from LLM Response")
    class JsonExtractionTests {

        @Test
        @DisplayName("should extract JSON from markdown code block")
        void extractFromCodeBlock() throws Exception {
            String response = """
                    Some text before
                    ```json
                    {"departure_station": "Hà Nội", "arrival_station": "Sài Gòn"}
                    ```
                    Some text after
                    """;

            String json = invokeExtractJson(response);
            assertNotNull(json);
            assertTrue(json.contains("Hà Nội"));
        }

        @Test
        @DisplayName("should extract raw JSON object")
        void extractRawJson() throws Exception {
            String response = """
                    Here is the result:
                    {"departure_station": "Đà Nẵng", "arrival_station": "Huế", "departure_date": "2025-03-25"}
                    """;

            String json = invokeExtractJson(response);
            assertNotNull(json);
            assertTrue(json.contains("Đà Nẵng"));
        }

        @Test
        @DisplayName("should remove thinking tags before extraction")
        void removeThinkingTags() throws Exception {
            String response = """
                    <think>
                    The user wants to book a ticket from Hanoi to HCMC.
                    </think>
                    {"departure_station": "Hà Nội", "arrival_station": "TP HCM"}
                    """;

            String json = invokeExtractJson(response);
            assertNotNull(json);
            assertFalse(json.contains("<think>"));
            assertTrue(json.contains("Hà Nội"));
        }
    }

    @Nested
    @DisplayName("Booking JSON Parsing")
    class BookingParsingTests {

        @Test
        @DisplayName("should parse complete booking JSON")
        void parseComplete() throws Exception {
            String json = """
                    {"departure_station": "Hà Nội", "arrival_station": "Sài Gòn", "departure_date": "2025-03-25", "departure_time": "08:00"}
                    """;

            Map<String, String> result = invokeParseBookingJson(json);
            assertEquals(4, result.size());
            assertEquals("Hà Nội", result.get("departure_station"));
            assertEquals("Sài Gòn", result.get("arrival_station"));
            assertEquals("2025-03-25", result.get("departure_date"));
            assertEquals("08:00", result.get("departure_time"));
        }

        @Test
        @DisplayName("should skip null and empty values")
        void skipNullEmpty() throws Exception {
            String json = """
                    {"departure_station": "Hà Nội", "arrival_station": "", "departure_date": null}
                    """;

            Map<String, String> result = invokeParseBookingJson(json);
            assertEquals(1, result.size());
            assertTrue(result.containsKey("departure_station"));
            assertFalse(result.containsKey("arrival_station"));
            assertFalse(result.containsKey("departure_date"));
        }

        @Test
        @DisplayName("should return empty map for invalid JSON")
        void invalidJson() throws Exception {
            Map<String, String> result = invokeParseBookingJson("not valid json");
            assertTrue(result.isEmpty());
        }
    }

    // Helper methods to access private methods via reflection for testing
    private String invokeExtractJson(String content) throws Exception {
        Method method = LlmService.class.getDeclaredMethod("extractJsonFromResponse", String.class);
        method.setAccessible(true);
        return (String) method.invoke(llmService, content);
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> invokeParseBookingJson(String json) throws Exception {
        Method method = LlmService.class.getDeclaredMethod("parseBookingJson", String.class);
        method.setAccessible(true);
        return (Map<String, String>) method.invoke(llmService, json);
    }
}
