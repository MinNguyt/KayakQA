package com.example.fleet.application;

import com.example.fleet.domain.model.BusCompany;
import com.example.fleet.domain.repository.BusCompanyRepository;
import com.example.fleet.infrastructure.exception.ResourceNotFoundException;
import com.example.fleet.infrastructure.exception.ConflictException;
import com.example.fleet.infrastructure.service.FileStorageService;
import com.example.fleet.presentation.dto.buscompany.*;

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
public class BusCompanyService {

    private final BusCompanyRepository busCompanyRepository;
    private final FileStorageService fileStorageService;

    public Page<BusCompanyResponseDTO> getAllCompanies(BusCompanyQueryDTO query) {
        log.info("Fetching bus companies with page={}, limit={}, search={}",
                query.getPage(), query.getLimit(), query.getSearch());

        Pageable pageable = PageRequest.of(query.getPage() - 1, query.getLimit());
        Page<BusCompany> companies = busCompanyRepository.findAllByPagination(pageable, query.getSearch());

        return companies.map(BusCompanyResponseDTO::fromEntity);
    }

    public BusCompanyResponseDTO getCompanyById(Integer id) {
        log.info("Fetching bus company by id={}", id);
        BusCompany company = busCompanyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus company not found with id: " + id));
        return BusCompanyResponseDTO.fromEntity(company);
    }

    @Transactional
    public BusCompanyResponseDTO createCompany(BusCompanyCreateDTO request, MultipartFile image) {
        log.info("Creating new bus company: {}", request.getCompanyName());

        if (busCompanyRepository.existsByCompanyName(request.getCompanyName())) {
            throw new ConflictException("Bus company already exists with name: " + request.getCompanyName());
        }

        String imagePath = null;
        if (image != null && !image.isEmpty()) {
            imagePath = fileStorageService.storeFile(image, "bus_company");
        }

        BusCompany company = BusCompany.builder()
                .companyName(request.getCompanyName())
                .image(imagePath)
                .logoUrl(request.getLogoUrl() != null ? request.getLogoUrl() : "")
                .contactPhone(request.getContactPhone())
                .contactEmail(request.getContactEmail())
                .address(request.getAddress() != null ? request.getAddress() : "Viet Nam")
                .markdownContent(request.getMarkdownContent())
                .markdownHtml(request.getMarkdownHtml())
                .descriptions(request.getDescriptions())
                .isActive(1)
                .build();

        BusCompany saved = busCompanyRepository.save(company);
        log.info("Bus company created successfully with id={}", saved.getId());

        return BusCompanyResponseDTO.fromEntity(saved);
    }

    @Transactional
    public BusCompanyResponseDTO updateCompany(Integer id, BusCompanyUpdateDTO request, MultipartFile image) {
        log.info("Updating bus company id={}", id);

        BusCompany company = busCompanyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus company not found with id: " + id));

        if (request.getCompanyName() != null) {
            company.setCompanyName(request.getCompanyName());
        }
        if (request.getLogoUrl() != null) {
            company.setLogoUrl(request.getLogoUrl());
        }
        if (request.getContactPhone() != null) {
            company.setContactPhone(request.getContactPhone());
        }
        if (request.getContactEmail() != null) {
            company.setContactEmail(request.getContactEmail());
        }
        if (request.getAddress() != null) {
            company.setAddress(request.getAddress());
        }
        if (request.getMarkdownContent() != null) {
            company.setMarkdownContent(request.getMarkdownContent());
        }
        if (request.getMarkdownHtml() != null) {
            company.setMarkdownHtml(request.getMarkdownHtml());
        }
        if (request.getDescriptions() != null) {
            company.setDescriptions(request.getDescriptions());
        }
        if (request.getIsActive() != null) {
            company.setIsActive(request.getIsActive());
        }

        if (image != null && !image.isEmpty()) {
            String imagePath = fileStorageService.storeFile(image, "bus_company");
            company.setImage(imagePath);
        }

        BusCompany updated = busCompanyRepository.save(company);
        log.info("Bus company updated successfully id={}", id);

        return BusCompanyResponseDTO.fromEntity(updated);
    }

    @Transactional
    public void deleteCompany(Integer id) {
        log.info("Deleting bus company id={}", id);

        BusCompany company = busCompanyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus company not found with id: " + id));

        busCompanyRepository.delete(company);
        log.info("Bus company deleted successfully id={}", id);
    }
}
