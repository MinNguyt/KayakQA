package com.example.chatbot.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for IntentDetectionService — tests cosine similarity-based intent
 * matching
 * and keyword fallback.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("IntentDetectionService")
class IntentDetectionServiceTest {

    @Mock
    private EmbeddingService embeddingService;

    @InjectMocks
    private IntentDetectionService intentDetectionService;

    @Nested
    @DisplayName("Keyword Fallback Detection")
    class KeywordFallbackTests {

        @Test
        @DisplayName("should detect greeting intent")
        void detectGreeting() {
            // When embeddings aren't loaded, falls back to keyword matching
            String intent = intentDetectionService.detectIntent("xin chào bạn");
            assertEquals("greeting", intent);
        }

        @Test
        @DisplayName("should detect greeting from 'hello'")
        void detectGreetingHello() {
            String intent = intentDetectionService.detectIntent("hello");
            assertEquals("greeting", intent);
        }

        @Test
        @DisplayName("should detect book_ticket intent")
        void detectBookTicket() {
            String intent = intentDetectionService.detectIntent("tôi muốn đặt vé xe");
            assertEquals("book_ticket", intent);
        }

        @Test
        @DisplayName("should detect book_ticket from 'mua vé'")
        void detectBookTicketMuaVe() {
            String intent = intentDetectionService.detectIntent("mua vé đi Sài Gòn");
            assertEquals("book_ticket", intent);
        }

        @Test
        @DisplayName("should detect check_schedule intent")
        void detectCheckSchedule() {
            String intent = intentDetectionService.detectIntent("xem lịch trình chuyến xe");
            assertEquals("check_schedule", intent);
        }

        @Test
        @DisplayName("should detect collect_information intent")
        void detectCollectInfo() {
            String intent = intentDetectionService.detectIntent("đi từ Hà Nội đến Đà Nẵng");
            assertEquals("collect_information", intent);
        }

        @Test
        @DisplayName("should return 'other' for unrecognized message")
        void detectOther() {
            String intent = intentDetectionService.detectIntent("thời tiết hôm nay thế nào");
            assertEquals("other", intent);
        }
    }

    @Nested
    @DisplayName("Embedding-based Detection")
    class EmbeddingDetectionTests {

        @Test
        @DisplayName("should detect intent from pre-computed embedding vector")
        void detectFromEmbedding() {
            // When no intent embeddings loaded, should return "other"
            List<Double> fakeEmbedding = List.of(0.1, 0.2, 0.3);
            String intent = intentDetectionService.detectIntent(fakeEmbedding);
            assertEquals("other", intent);
        }
    }
}
