package com.example.chatbot.application;

import com.example.chatbot.domain.model.ConversationState;
import com.example.chatbot.domain.repository.ChatHistoryRepository;
import com.example.chatbot.domain.repository.ConversationStateRepository;
import com.example.chatbot.infrastructure.grpc.FleetGrpcClient;
import com.example.chatbot.infrastructure.grpc.RouteGrpcClient;
import com.example.chatbot.infrastructure.grpc.ScheduleGrpcClient;
import com.example.chatbot.infrastructure.grpc.proto.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ChatbotService — tests the full RAG orchestration flow
 * with mocked dependencies.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ChatbotService")
class ChatbotServiceTest {

        @Mock
        private IntentDetectionService intentDetectionService;
        @Mock
        private EmbeddingService embeddingService;
        @Mock
        private LlmService llmService;
        @Mock
        private RouteGrpcClient routeGrpcClient;
        @Mock
        private ScheduleGrpcClient scheduleGrpcClient;
        @Mock
        private FleetGrpcClient fleetGrpcClient;
        @Mock
        private ChatHistoryRepository chatHistoryRepository;
        @Mock
        private ConversationStateRepository conversationStateRepository;

        @InjectMocks
        private ChatbotService chatbotService;

        @Nested
        @DisplayName("Greeting Intent")
        class GreetingTests {

                @Test
                @DisplayName("should return greeting response with instructions")
                void handleGreeting() {
                        when(intentDetectionService.detectIntent(anyString())).thenReturn("greeting");
                        // when(conversationStateRepository.findByUserId(anyInt())).thenReturn(Optional.empty());

                        Map<String, Object> result = chatbotService.processMessage("Xin chào", 1);

                        assertEquals("greeting", result.get("intent"));
                        String reply = (String) result.get("reply");
                        assertNotNull(reply);
                        assertTrue(reply.contains("Xin chào"));
                        assertTrue(reply.contains("Điểm đi"));
                }
        }

        @Nested
        @DisplayName("Booking Flow — Collect Information")
        class CollectInfoTests {

                @Test
                @DisplayName("should ask for missing fields when not all info provided")
                void askForMissingFields() {
                        when(intentDetectionService.detectIntent(anyString())).thenReturn("collect_information");
                        when(conversationStateRepository.findByUserId(anyInt())).thenReturn(Optional.empty());
                        when(llmService.extractBookingFeatures(anyString()))
                                        .thenReturn(Map.of("departure_station", "Hà Nội"));

                        Map<String, Object> result = chatbotService.processMessage("Tôi muốn đi từ Hà Nội", 1);

                        assertEquals("collect_information", result.get("intent"));
                        String reply = (String) result.get("reply");
                        assertNotNull(reply);
                        assertTrue(reply.contains("Điểm đến") || reply.contains("Ngày đi"));

                        @SuppressWarnings("unchecked")
                        List<String> missing = (List<String>) result.get("missing");
                        assertNotNull(missing);
                        assertTrue(missing.contains("arrival_station") || missing.contains("departure_date"));
                }

                @Test
                @DisplayName("should merge with existing conversation state")
                void mergeWithExistingState() {
                        ConversationState existingState = ConversationState.builder()
                                        .userId(1)
                                        .collected("{\"departure_station\": \"Hà Nội\"}")
                                        .build();
                        when(intentDetectionService.detectIntent(anyString())).thenReturn("collect_information");
                        when(conversationStateRepository.findByUserId(1)).thenReturn(Optional.of(existingState));
                        when(llmService.extractBookingFeatures(anyString()))
                                        .thenReturn(Map.of("arrival_station", "Sài Gòn"));

                        Map<String, Object> result = chatbotService.processMessage("đến Sài Gòn", 1);

                        @SuppressWarnings("unchecked")
                        Map<String, String> collected = (Map<String, String>) result.get("collected");
                        assertNotNull(collected);
                        assertEquals("Hà Nội", collected.get("departure_station"));
                        assertEquals("Sài Gòn", collected.get("arrival_station"));
                }
        }

        @Nested
        @DisplayName("Booking Flow — Full Search")
        class FullSearchTests {

                @Test
                @DisplayName("should perform full gRPC search when all fields collected")
                void fullSearch() {
                        when(intentDetectionService.detectIntent(anyString())).thenReturn("book_ticket");
                        when(conversationStateRepository.findByUserId(anyInt())).thenReturn(Optional.empty());
                        when(llmService.extractBookingFeatures(anyString()))
                                        .thenReturn(Map.of(
                                                        "departure_station", "Hà Nội",
                                                        "arrival_station", "Sài Gòn",
                                                        "departure_date", "2025-03-25"));

                        List<Double> fakeEmbedding = List.of(0.1, 0.2, 0.3);
                        when(embeddingService.embed(anyString())).thenReturn(fakeEmbedding);

                        // Mock station search
                        StationSearchResponse depStations = StationSearchResponse.newBuilder()
                                        .addStations(StationMatch.newBuilder()
                                                        .setId(1).setName("Hà Nội").setCity("Hà Nội")
                                                        .setSimilarity(0.95).build())
                                        .build();
                        StationSearchResponse arrStations = StationSearchResponse.newBuilder()
                                        .addStations(StationMatch.newBuilder()
                                                        .setId(2).setName("Sài Gòn").setCity("TP HCM")
                                                        .setSimilarity(0.92).build())
                                        .build();
                        when(routeGrpcClient.searchStations(anyList(), eq(1)))
                                        .thenReturn(depStations)
                                        .thenReturn(arrStations);

                        // Mock route search
                        RouteSearchResponse routes = RouteSearchResponse.newBuilder()
                                        .addRoutes(RouteMatch.newBuilder()
                                                        .setId(1)
                                                        .setDepartureStationId(1).setArrivalStationId(2)
                                                        .setDepartureStationName("Hà Nội")
                                                        .setArrivalStationName("Sài Gòn")
                                                        .setDistanceKm("1600").setEstimatedDurationHours("24")
                                                        .build())
                                        .build();
                        when(routeGrpcClient.searchRoutes(1, 2)).thenReturn(routes);

                        // Mock schedule search
                        ScheduleSearchResponse schedules = ScheduleSearchResponse.newBuilder()
                                        .addSchedules(ScheduleMatch.newBuilder()
                                                        .setId(1).setRouteId(1).setBusId(1)
                                                        .setDepartureTime("2025-03-25T08:00:00")
                                                        .setArrivalTime("2025-03-26T08:00:00")
                                                        .setAvailableSeats(30).setTotalSeats(40)
                                                        .setStatus("AVAILABLE")
                                                        .build())
                                        .build();
                        when(scheduleGrpcClient.searchSchedules(1, "2025-03-25")).thenReturn(schedules);

                        // Mock fleet search
                        VehicleSearchResponse vehicleResponse = VehicleSearchResponse.newBuilder()
                                        .setVehicle(VehicleMatch.newBuilder()
                                                        .setId(1).setName("Xe Giường Nằm 40")
                                                        .setLicensePlate("30A-12345")
                                                        .setCapacity(40).setCompanyName("Phương Trang")
                                                        .build())
                                        .build();
                        when(fleetGrpcClient.searchVehicles(1)).thenReturn(vehicleResponse);

                        Map<String, Object> result = chatbotService.processMessage(
                                        "Đặt vé từ Hà Nội đi Sài Gòn ngày 25 tháng 3", 1);

                        assertEquals("book_ticket", result.get("intent"));
                        assertNotNull(result.get("reply"));
                        assertNotNull(result.get("data"));
                        String reply = (String) result.get("reply");
                        assertTrue(reply.contains("Hà Nội"));
                        assertTrue(reply.contains("Sài Gòn"));
                }

                @Test
                @DisplayName("should handle no stations found")
                void noStationsFound() {
                        when(intentDetectionService.detectIntent(anyString())).thenReturn("book_ticket");
                        when(conversationStateRepository.findByUserId(anyInt())).thenReturn(Optional.empty());
                        when(llmService.extractBookingFeatures(anyString()))
                                        .thenReturn(Map.of(
                                                        "departure_station", "Unknown Place",
                                                        "arrival_station", "Nowhere",
                                                        "departure_date", "2025-03-25"));
                        when(embeddingService.embed(anyString())).thenReturn(List.of(0.1, 0.2));

                        StationSearchResponse emptyResponse = StationSearchResponse.newBuilder().build();
                        when(routeGrpcClient.searchStations(anyList(), eq(1))).thenReturn(emptyResponse);

                        Map<String, Object> result = chatbotService.processMessage("Đặt vé đi Unknown", 1);

                        String reply = (String) result.get("reply");
                        assertTrue(reply.contains("Không tìm thấy"));
                }
        }

        @Nested
        @DisplayName("Other Intent")
        class OtherIntentTests {

                @Test
                @DisplayName("should delegate to LLM for general questions")
                void handleOther() {
                        when(intentDetectionService.detectIntent(anyString())).thenReturn("other");
                        when(llmService.generateResponse(anyString(), anyString()))
                                        .thenReturn("Tôi có thể giúp bạn đặt vé xe khách.");

                        Map<String, Object> result = chatbotService.processMessage("Thời tiết hôm nay?", 1);

                        assertEquals("other", result.get("intent"));
                        assertEquals("Tôi có thể giúp bạn đặt vé xe khách.", result.get("reply"));
                }
        }

        @Nested
        @DisplayName("Error Handling")
        class ErrorHandlingTests {

                @Test
                @DisplayName("should handle gRPC errors gracefully")
                void handleGrpcError() {
                        when(intentDetectionService.detectIntent(anyString())).thenReturn("book_ticket");
                        when(conversationStateRepository.findByUserId(anyInt())).thenReturn(Optional.empty());
                        when(llmService.extractBookingFeatures(anyString()))
                                        .thenReturn(Map.of(
                                                        "departure_station", "Hà Nội",
                                                        "arrival_station", "Sài Gòn",
                                                        "departure_date", "2025-03-25"));
                        when(embeddingService.embed(anyString())).thenThrow(new RuntimeException("gRPC unavailable"));

                        Map<String, Object> result = chatbotService.processMessage("Đặt vé", 1);

                        String reply = (String) result.get("reply");
                        assertTrue(reply.contains("lỗi") || reply.contains("thử lại"));
                }
        }
}
