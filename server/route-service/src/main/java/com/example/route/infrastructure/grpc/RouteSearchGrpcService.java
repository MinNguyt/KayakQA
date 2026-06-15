package com.example.route.infrastructure.grpc;

import com.example.route.domain.model.Route;
import com.example.route.domain.model.Station;
import com.example.route.domain.repository.RouteRepository;
import com.example.route.domain.repository.StationRepository;
import com.example.route.infrastructure.grpc.proto.*;
import com.example.route.infrastructure.service.EmbeddingService;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class RouteSearchGrpcService extends RouteSearchServiceGrpc.RouteSearchServiceImplBase {

    private final StationRepository stationRepository;
    private final RouteRepository routeRepository;
    private final EmbeddingService embeddingService;

    @Override
    public void searchStations(EmbeddingSearchRequest request, StreamObserver<StationSearchResponse> responseObserver) {
        try {
            List<Double> queryEmbedding = request.getEmbeddingList();
            int topK = request.getTopK() > 0 ? request.getTopK() : 3;

            List<Station> allStations = stationRepository.findAll();

            // Compute cosine similarity for each station that has an embedding
            List<Map.Entry<Station, Double>> scored = new ArrayList<>();
            for (Station station : allStations) {
                List<Double> stationEmbedding = embeddingService.fromJson(station.getEmbedding());
                if (stationEmbedding != null) {
                    double similarity = EmbeddingService.cosineSimilarity(queryEmbedding, stationEmbedding);
                    scored.add(Map.entry(station, similarity));
                }
            }

            // Sort by similarity descending, take top-K
            scored.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));
            List<Map.Entry<Station, Double>> topResults = scored.stream().limit(topK).toList();

            StationSearchResponse.Builder responseBuilder = StationSearchResponse.newBuilder();
            for (Map.Entry<Station, Double> entry : topResults) {
                Station s = entry.getKey();
                responseBuilder.addStations(StationMatch.newBuilder()
                        .setId(s.getId())
                        .setName(s.getName() != null ? s.getName() : "")
                        .setCity(s.getCity() != null ? s.getCity() : "")
                        .setProvince(s.getProvince() != null ? s.getProvince() : "")
                        .setSimilarity(entry.getValue())
                        .build());
            }

            responseObserver.onNext(responseBuilder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error in searchStations", e);
            responseObserver.onError(io.grpc.Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asRuntimeException());
        }
    }

    @Override
    public void searchRoutes(RouteSearchRequest request, StreamObserver<RouteSearchResponse> responseObserver) {
        try {
            List<Route> routes;
            if (request.getDepartureStationId() > 0 && request.getArrivalStationId() > 0) {
                routes = routeRepository.findByDepartureStationIdAndArrivalStationId(
                        request.getDepartureStationId(), request.getArrivalStationId());
            } else if (request.getDepartureStationId() > 0) {
                routes = routeRepository.findByDepartureStationId(request.getDepartureStationId());
            } else {
                routes = routeRepository.findAll();
            }

            RouteSearchResponse.Builder responseBuilder = RouteSearchResponse.newBuilder();
            for (Route r : routes) {
                RouteMatch.Builder matchBuilder = RouteMatch.newBuilder()
                        .setId(r.getId())
                        .setDepartureStationId(r.getDepartureStation().getId())
                        .setArrivalStationId(r.getArrivalStation().getId())
                        .setDepartureStationName(
                                r.getDepartureStation().getName() != null ? r.getDepartureStation().getName() : "")
                        .setArrivalStationName(
                                r.getArrivalStation().getName() != null ? r.getArrivalStation().getName() : "")
                        .setDistanceKm(r.getDistanceKm() != null ? r.getDistanceKm() : "")
                        .setEstimatedDurationHours(
                                r.getEstimatedDurationHours() != null ? r.getEstimatedDurationHours() : "");
                responseBuilder.addRoutes(matchBuilder.build());
            }

            responseObserver.onNext(responseBuilder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error in searchRoutes", e);
            responseObserver.onError(io.grpc.Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asRuntimeException());
        }
    }
}
