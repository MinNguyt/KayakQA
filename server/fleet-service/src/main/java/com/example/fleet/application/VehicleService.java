package com.example.fleet.application;

import com.example.fleet.domain.model.BusCompany;
import com.example.fleet.domain.model.Vehicle;
import com.example.fleet.domain.repository.BusCompanyRepository;
import com.example.fleet.domain.repository.VehicleRepository;
import com.example.fleet.infrastructure.exception.ResourceNotFoundException;
import com.example.fleet.infrastructure.service.FileStorageService;
import com.example.fleet.presentation.dto.vehicle.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final BusCompanyRepository busCompanyRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public Page<VehicleResponseDTO> getAllVehicles(VehicleQueryDTO query) {
        log.info("Fetching vehicles with page={}, limit={}, search={}, companyId={}",
                query.getPage(), query.getLimit(), query.getSearch(), query.getCompany_id());

        Pageable pageable = PageRequest.of(query.getPage() - 1, query.getLimit());
        Page<Vehicle> vehicles;

        if (query.getCompany_id() != null) {
            vehicles = vehicleRepository.findByCompanyIdWithPagination(
                    pageable, query.getCompany_id(), query.getSearch());
        } else {
            vehicles = vehicleRepository.findAllByPagination(pageable, query.getSearch());
        }

        return vehicles.map(VehicleResponseDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public VehicleResponseDTO getVehicleById(Integer id) {
        log.info("Fetching vehicle by id={}", id);
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        return VehicleResponseDTO.fromEntity(vehicle);
    }

    @Transactional
    public VehicleResponseDTO createVehicle(VehicleCreateDTO request, MultipartFile featuredImage) {
        log.info("Creating new vehicle: {} for company: {}", request.getName(), request.getCompany_id());

        BusCompany company = busCompanyRepository.findById(request.getCompany_id())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Bus company not found with id: " + request.getCompany_id()));

        String imagePath = "";
        if (featuredImage != null && !featuredImage.isEmpty()) {
            imagePath = fileStorageService.storeFile(featuredImage, "vehicle");
        }

        Vehicle vehicle = Vehicle.builder()
                .name(request.getName())
                .licensePlate(request.getLicensePlate())
                .capacity(request.getCapacity())
                .busCompany(company)
                .featuredImage(imagePath)
                .markdownContent(request.getMarkdownContent())
                .markdownHtml(request.getMarkdownHtml())
                .build();

        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Vehicle created successfully with id={}", saved.getId());

        return VehicleResponseDTO.fromEntity(saved);
    }

    @Transactional
    public VehicleResponseDTO updateVehicle(Integer id, VehicleUpdateDTO request, MultipartFile featuredImage) {
        log.info("Updating vehicle id={}", id);

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        if (request.getName() != null) {
            vehicle.setName(request.getName());
        }
        if (request.getLicensePlate() != null) {
            vehicle.setLicensePlate(request.getLicensePlate());
        }
        if (request.getCapacity() != null) {
            vehicle.setCapacity(request.getCapacity());
        }
        if (request.getMarkdownContent() != null) {
            vehicle.setMarkdownContent(request.getMarkdownContent());
        }
        if (request.getMarkdownHtml() != null) {
            vehicle.setMarkdownHtml(request.getMarkdownHtml());
        }
        if (request.getCompany_id() != null) {
            BusCompany company = busCompanyRepository.findById(request.getCompany_id())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Bus company not found with id: " + request.getCompany_id()));
            vehicle.setBusCompany(company);
        }

        if (featuredImage != null && !featuredImage.isEmpty()) {
            String imagePath = fileStorageService.storeFile(featuredImage, "vehicle");
            vehicle.setFeaturedImage(imagePath);
        }

        Vehicle updated = vehicleRepository.save(vehicle);
        log.info("Vehicle updated successfully id={}", id);

        return VehicleResponseDTO.fromEntity(updated);
    }

    @Transactional
    public void deleteVehicle(Integer id) {
        log.info("Deleting vehicle id={}", id);

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        vehicleRepository.delete(vehicle);
        log.info("Vehicle deleted successfully id={}", id);
    }
}
