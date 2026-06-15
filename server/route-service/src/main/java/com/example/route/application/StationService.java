package com.example.route.application;

import com.example.route.domain.model.Station;
import com.example.route.domain.repository.StationRepository;
import com.example.route.infrastructure.exception.ResourceNotFoundException;
import com.example.route.infrastructure.service.EmbeddingService;
import com.example.route.infrastructure.service.FileStorageService;
import com.example.route.presentation.dto.PageResponse;
import com.example.route.presentation.dto.station.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StationService {

    private final StationRepository stationRepository;
    private final FileStorageService fileStorageService;
    private final EmbeddingService embeddingService;

    @Transactional(readOnly = true)
    public PageResponse<StationResponseDTO> getAllStations(StationQueryDTO query) {
        log.info("Fetching stations with page={}, limit={}, search={}",
                query.getPage(), query.getLimit(), query.getSearch());

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if (query.getSortBy() != null && !query.getSortBy().isEmpty()) {
            Sort.Direction direction = "asc".equalsIgnoreCase(query.getOrder())
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
            sort = Sort.by(direction, query.getSortBy());
        }

        Pageable pageable = PageRequest.of(query.getPage() - 1, query.getLimit(), sort);
        Page<Station> stations = stationRepository.findAllByPagination(pageable, query.getSearch());

        List<StationResponseDTO> stationDTOs = stations.getContent().stream()
                .map(StationResponseDTO::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.<StationResponseDTO>builder()
                .results(stationDTOs)
                .total((int) stations.getTotalElements())
                .page(query.getPage())
                .limit(query.getLimit())
                .totalPages(stations.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public StationResponseDTO getStationById(Integer id) {
        log.info("Fetching station by id={}", id);
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with id: " + id));
        return StationResponseDTO.fromEntity(station);
    }

    @Transactional
    public StationResponseDTO createStation(StationCreateDTO request, MultipartFile image, MultipartFile wallpaper) {
        log.info("Creating new station: {}", request.getName());

        String imagePath = "";
        if (image != null && !image.isEmpty()) {
            imagePath = fileStorageService.storeFile(image, "station");
        }

        String wallpaperPath = "";
        if (wallpaper != null && !wallpaper.isEmpty()) {
            wallpaperPath = fileStorageService.storeFile(wallpaper, "wallpaper");
        }

        Station station = Station.builder()
                .name(request.getName())
                .descriptions(request.getDescriptions())
                .location(request.getLocation())
                .city(request.getCity())
                .province(request.getProvince())
                .image(imagePath)
                .wallpaper(wallpaperPath)
                .isActive(1)
                .build();

        // Generate embedding vector for semantic search
        generateAndSetEmbedding(station);

        Station saved = stationRepository.save(station);
        log.info("Station created successfully with id={}", saved.getId());

        return StationResponseDTO.fromEntity(saved);
    }

    @Transactional
    public StationResponseDTO updateStation(Integer id, StationUpdateDTO request,
            MultipartFile image, MultipartFile wallpaper) {
        log.info("Updating station id={}", id);

        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with id: " + id));

        if (request.getName() != null) {
            station.setName(request.getName());
        }
        if (request.getDescriptions() != null) {
            station.setDescriptions(request.getDescriptions());
        }
        if (request.getLocation() != null) {
            station.setLocation(request.getLocation());
        }
        if (request.getCity() != null) {
            station.setCity(request.getCity());
        }
        if (request.getProvince() != null) {
            station.setProvince(request.getProvince());
        }

        if (image != null && !image.isEmpty()) {
            String imagePath = fileStorageService.storeFile(image, "station");
            station.setImage(imagePath);
        }

        if (wallpaper != null && !wallpaper.isEmpty()) {
            String wallpaperPath = fileStorageService.storeFile(wallpaper, "wallpaper");
            station.setWallpaper(wallpaperPath);
        }

        // Re-generate embedding vector with updated fields
        generateAndSetEmbedding(station);

        Station updated = stationRepository.save(station);
        log.info("Station updated successfully id={}", id);

        return StationResponseDTO.fromEntity(updated);
    }

    @Transactional
    public void deleteStation(Integer id) {
        log.info("Deleting station id={}", id);

        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with id: " + id));

        stationRepository.delete(station);
        log.info("Station deleted successfully id={}", id);
    }

    /**
     * Build a descriptive text from station fields for embedding generation.
     */
    private String buildEmbeddingText(Station station) {
        StringBuilder sb = new StringBuilder();
        if (station.getName() != null) {
            sb.append("Bến xe ").append(station.getName());
        }
        if (station.getCity() != null) {
            sb.append(", thành phố ").append(station.getCity());
        }
        if (station.getProvince() != null) {
            sb.append(", tỉnh ").append(station.getProvince());
        }
        if (station.getLocation() != null) {
            sb.append(", địa chỉ ").append(station.getLocation());
        }
        if (station.getDescriptions() != null && !station.getDescriptions().isEmpty()) {
            sb.append(". ").append(station.getDescriptions());
        }
        return sb.toString().trim();
    }

    /**
     * Generate embedding vector and set it on the station entity.
     * Failures are logged but do not prevent station creation/update.
     */
    private void generateAndSetEmbedding(Station station) {
        try {
            String text = buildEmbeddingText(station);
            if (!text.isEmpty()) {
                List<Double> vector = embeddingService.embed(text);
                String embeddingJson = embeddingService.toJson(vector);
                station.setEmbedding(embeddingJson);
                log.info("Embedding generated successfully for station: {}", station.getName());
            }
        } catch (Exception e) {
            log.warn("Failed to generate embedding for station: {}. Station will be saved without embedding.",
                    station.getName(), e);
        }
    }
}
