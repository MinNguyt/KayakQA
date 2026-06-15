package com.example.chatbot.application;

import com.example.chatbot.domain.model.ChatHistory;
import com.example.chatbot.domain.model.ConversationState;
import com.example.chatbot.domain.repository.ChatHistoryRepository;
import com.example.chatbot.domain.repository.ConversationStateRepository;
import com.example.chatbot.infrastructure.grpc.FleetGrpcClient;
import com.example.chatbot.infrastructure.grpc.RouteGrpcClient;
import com.example.chatbot.infrastructure.grpc.ScheduleGrpcClient;
import com.example.chatbot.infrastructure.grpc.proto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Main chatbot orchestrator implementing the RAG pipeline:
 * User Message → Intent Detection → Feature Extraction (LLM) → gRPC Search →
 * Response
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ChatbotService {

    private final IntentDetectionService intentDetectionService;
    private final EmbeddingService embeddingService;
    private final LlmService llmService;
    private final RouteGrpcClient routeGrpcClient;
    private final ScheduleGrpcClient scheduleGrpcClient;
    private final FleetGrpcClient fleetGrpcClient;
    private final ChatHistoryRepository chatHistoryRepository;
    private final ConversationStateRepository conversationStateRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final List<String> REQUIRED_FIELDS = List.of(
            "departure_station", "arrival_station", "departure_date");

    @Transactional
    public Map<String, Object> processMessage(String message, Integer userId) {
        log.info("Processing message from user {}: {}", userId, message);

        // 1. Detect intent
        String intent = intentDetectionService.detectIntent(message);
        log.info("Detected intent: {}", intent);

        // 2. Process based on intent
        Map<String, Object> result = switch (intent) {
            case "greeting" -> handleGreeting(message);
            case "book_ticket", "collect_information", "check_schedule" ->
                handleBookingFlow(message, userId, intent);
            default -> handleOther(message);
        };

        // 3. Save chat history
        saveChatHistory(userId, intent, message, result.getOrDefault("reply", "").toString());

        result.put("intent", intent);
        return result;
    }

    @Transactional
    public void clearConversationState(Integer userId) {
        conversationStateRepository.deleteByUserId(userId);
        log.info("Cleared conversation state for user {}", userId);
    }

    // --- Intent Handlers ---

    private Map<String, Object> handleGreeting(String message) {
        Map<String, Object> result = new HashMap<>();
        result.put("reply", "Xin chào!  Tôi là trợ lý đặt vé xe khách. " +
                "Bạn muốn đặt vé đi đâu? Hãy cho tôi biết:\n" +
                "• Điểm đi\n• Điểm đến\n• Ngày đi\n" +
                "Ví dụ: \"Tôi muốn đặt vé từ Hà Nội đi Sài Gòn ngày 25 tháng 3\"");
        return result;
    }

    private Map<String, Object> handleBookingFlow(String message, Integer userId, String intent) {
        Map<String, Object> result = new HashMap<>();

        try {
            // 1. Extract booking features using LLM
            Map<String, String> extracted = llmService.extractBookingFeatures(message);
            log.info("Extracted features: {}", extracted);

            // 2. Merge with existing conversation state
            Map<String, String> collected = mergeWithExistingState(userId, extracted);
            log.info("Merged collected data: {}", collected);

            // 3. Check which fields are still missing
            List<String> missingFields = REQUIRED_FIELDS.stream()
                    .filter(f -> !collected.containsKey(f) || collected.get(f).isEmpty())
                    .toList();

            if (!missingFields.isEmpty()) {
                // Save partial state and ask for missing info
                saveConversationState(userId, collected, missingFields);
                result.put("reply", buildMissingFieldsPrompt(collected, missingFields));
                result.put("collected", collected);
                result.put("missing", missingFields);
                return result;
            }

            // 4. All required fields collected — search via gRPC
            Map<String, Object> searchResults = performSearch(collected);
            result.putAll(searchResults);

            // 5. Clear conversation state after successful search
            conversationStateRepository.deleteByUserId(userId);

        } catch (Exception e) {
            log.error("Error in booking flow", e);
            result.put("reply", "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại.");
        }

        return result;
    }

    private Map<String, Object> handleOther(String message) {
        Map<String, Object> result = new HashMap<>();
        String response = llmService.generateResponse(
                "Bạn là trợ lý đặt vé xe khách. Trả lời câu hỏi một cách ngắn gọn và hữu ích bằng tiếng Việt. " +
                        "Nếu câu hỏi liên quan đến đặt vé, hãy hướng dẫn cung cấp thông tin: điểm đi, điểm đến, ngày đi.",
                message);
        result.put("reply", response);
        return result;
    }

    // --- gRPC Search Pipeline ---

    private Map<String, Object> performSearch(Map<String, String> collected) {
        Map<String, Object> result = new HashMap<>();

        String departureStation = collected.get("departure_station");
        String arrivalStation = collected.get("arrival_station");
        String departureDate = collected.get("departure_date");

        // Step 1: Find matching stations via embedding similarity
        List<Double> depEmbedding = embeddingService.embed(departureStation);
        List<Double> arrEmbedding = embeddingService.embed(arrivalStation);

        StationSearchResponse depStations = routeGrpcClient.searchStations(depEmbedding, 1);
        StationSearchResponse arrStations = routeGrpcClient.searchStations(arrEmbedding, 1);

        if (depStations.getStationsList().isEmpty() || arrStations.getStationsList().isEmpty()) {
            result.put("reply", "Không tìm thấy trạm phù hợp. Vui lòng kiểm tra lại tên điểm đi/đến.");
            return result;
        }

        StationMatch depMatch = depStations.getStations(0);
        StationMatch arrMatch = arrStations.getStations(0);

        log.info("Matched departure: {} (similarity: {})", depMatch.getName(), depMatch.getSimilarity());
        log.info("Matched arrival: {} (similarity: {})", arrMatch.getName(), arrMatch.getSimilarity());

        // Step 2: Find routes between matched stations
        RouteSearchResponse routes = routeGrpcClient.searchRoutes(depMatch.getId(), arrMatch.getId());

        if (routes.getRoutesList().isEmpty()) {
            result.put("reply", String.format(
                    "Không tìm thấy tuyến xe từ %s đến %s. Vui lòng thử tuyến khác.",
                    depMatch.getName(), arrMatch.getName()));
            return result;
        }

        // Step 3: Find schedules for the route on the given date
        List<Map<String, Object>> scheduleList = new ArrayList<>();
        for (RouteMatch route : routes.getRoutesList()) {
            ScheduleSearchResponse schedules = scheduleGrpcClient.searchSchedules(route.getId(), departureDate);

            for (ScheduleMatch schedule : schedules.getSchedulesList()) {
                Map<String, Object> scheduleInfo = new LinkedHashMap<>();
                scheduleInfo.put("scheduleId", schedule.getId());
                scheduleInfo.put("departureStationId", route.getDepartureStationId());
                scheduleInfo.put("arrivalStationId", route.getArrivalStationId());
                scheduleInfo.put("departureStation", route.getDepartureStationName());
                scheduleInfo.put("arrivalStation", route.getArrivalStationName());
                scheduleInfo.put("departureTime", schedule.getDepartureTime());
                scheduleInfo.put("arrivalTime", schedule.getArrivalTime());
                scheduleInfo.put("availableSeats", schedule.getAvailableSeats());
                scheduleInfo.put("totalSeats", schedule.getTotalSeats());
                scheduleInfo.put("status", schedule.getStatus());
                scheduleInfo.put("distanceKm", route.getDistanceKm());

                // Step 4: Get vehicle details
                try {
                    VehicleSearchResponse vehicleResponse = fleetGrpcClient.searchVehicles(schedule.getBusId());
                    log.info("Vehicle response: {}", vehicleResponse);
                    if (vehicleResponse.hasVehicle()) {
                        log.info("Vehicle found: {}", vehicleResponse.getVehicle());
                        VehicleMatch vehicle = vehicleResponse.getVehicle();
                        scheduleInfo.put("vehicleName", vehicle.getName());
                        scheduleInfo.put("licensePlate", vehicle.getLicensePlate());
                        scheduleInfo.put("companyName", vehicle.getCompanyName());
                        scheduleInfo.put("featureImage", vehicle.getFeaturedImage());
                    }
                } catch (Exception e) {
                    log.warn("Failed to get vehicle info for busId={}", schedule.getBusId(), e);
                }

                scheduleList.add(scheduleInfo);
            }
        }

        if (scheduleList.isEmpty()) {
            result.put("reply", String.format(
                    "Không có chuyến xe từ %s đến %s vào ngày %s. Vui lòng thử ngày khác.",
                    depMatch.getName(), arrMatch.getName(), departureDate));
            return result;
        }

        // Build response
        StringBuilder reply = new StringBuilder();
        reply.append(String.format(" Tìm thấy %d chuyến xe:",
                scheduleList.size(), depMatch.getName(), arrMatch.getName(), departureDate));

        for (int i = 0; i < scheduleList.size(); i++) {
            Map<String, Object> s = scheduleList.get(i);
            // reply.append(String.format("**Chuyến %d:**\n", i + 1));
            // reply.append(String.format("• Giờ đi: %s → Giờ đến: %s\n",
            // s.get("departureTime"), s.get("arrivalTime")));
            // reply.append(String.format("• Ghế trống: %s/%s\n",
            // s.get("availableSeats"), s.get("totalSeats")));
            // if (s.containsKey("vehicleName")) {
            // reply.append(String.format("• Xe: %s (%s) - %s\n",
            // s.get("vehicleName"), s.get("licensePlate"), s.get("companyName")));
            // }
            reply.append("\n");
        }

        // reply.append("Bạn muốn đặt chuyến nào? Hãy cho tôi biết số chuyến.");

        result.put("reply", reply.toString());
        result.put("data", scheduleList);
        return result;
    }

    // --- State Management ---

    @SuppressWarnings("unchecked")
    private Map<String, String> mergeWithExistingState(Integer userId, Map<String, String> newData) {
        Map<String, String> merged = new HashMap<>();

        // Load existing state
        conversationStateRepository.findByUserId(userId).ifPresent(state -> {
            try {
                if (state.getCollected() != null) {
                    Map<String, String> existing = objectMapper.readValue(state.getCollected(), Map.class);
                    merged.putAll(existing);
                }
            } catch (Exception e) {
                log.warn("Failed to parse existing conversation state", e);
            }
        });

        // Merge new data (overwrite existing)
        for (Map.Entry<String, String> entry : newData.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                merged.put(entry.getKey(), entry.getValue());
            }
        }

        return merged;
    }

    private void saveConversationState(Integer userId, Map<String, String> collected, List<String> pending) {
        try {
            String collectedJson = objectMapper.writeValueAsString(collected);
            String pendingJson = objectMapper.writeValueAsString(pending);

            ConversationState state = conversationStateRepository.findByUserId(userId)
                    .orElse(ConversationState.builder().userId(userId).build());
            state.setCollected(collectedJson);
            state.setPending(pendingJson);
            conversationStateRepository.save(state);
        } catch (Exception e) {
            log.error("Failed to save conversation state", e);
        }
    }

    private String buildMissingFieldsPrompt(Map<String, String> collected, List<String> missing) {
        StringBuilder sb = new StringBuilder();

        if (!collected.isEmpty()) {
            sb.append("Tôi đã ghi nhận:\n");
            if (collected.containsKey("departure_station")) {
                sb.append("• Điểm đi: ").append(collected.get("departure_station")).append("\n");
            }
            if (collected.containsKey("arrival_station")) {
                sb.append("• Điểm đến: ").append(collected.get("arrival_station")).append("\n");
            }
            if (collected.containsKey("departure_date")) {
                sb.append("• Ngày đi: ").append(collected.get("departure_date")).append("\n");
            }
            sb.append("\n");
        }

        sb.append("Vui lòng cung cấp thêm:\n");
        Map<String, String> fieldNames = Map.of(
                "departure_station", "Điểm đi (ví dụ: Hà Nội)",
                "arrival_station", "Điểm đến (ví dụ: Sài Gòn)",
                "departure_date", "Ngày đi (ví dụ: 2025-03-25)");
        for (String field : missing) {
            sb.append("• ").append(fieldNames.getOrDefault(field, field)).append("\n");
        }

        return sb.toString();
    }

    // --- Persistence ---

    private void saveChatHistory(Integer userId, String intent, String message, String response) {
        try {
            ChatHistory history = ChatHistory.builder()
                    .userId(userId)
                    .intent(intent)
                    .message(message)
                    .response(response)
                    .build();
            chatHistoryRepository.save(history);
        } catch (Exception e) {
            log.error("Failed to save chat history", e);
        }
    }
}
