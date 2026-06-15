package com.example.ticket.presentation.controller;

import com.example.ticket.application.PaymentService;
import com.example.ticket.application.TicketService;
import com.example.ticket.domain.model.Ticket;
import com.example.ticket.domain.model.TicketStatus;
import com.example.ticket.presentation.dto.ApiResponse;
import com.example.ticket.presentation.dto.PaginatedResponse;
import com.example.ticket.presentation.dto.SePayWebhookDTO;
import com.example.ticket.presentation.dto.TicketCreateDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final PaymentService paymentService;

    private Integer getCurrentUserId() {
        try {
            String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            return Integer.parseInt(userId);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
    }

    @PostMapping("/booking")
    public ApiResponse<Ticket> createBooking(@RequestBody TicketCreateDTO dto) {
        return ApiResponse.success(ticketService.createTicket(dto, getCurrentUserId()));
    }

    @GetMapping("/user/me")
    public ApiResponse<Object> getMyTickets() {
        return ApiResponse.success(ticketService.getUserTickets(getCurrentUserId()));
    }

    @GetMapping("/history")
    public ApiResponse<PaginatedResponse<Ticket>> getAllTickets(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) TicketStatus status) {
        return ApiResponse.success(ticketService.getAllTickets(page, limit, status));
    }

    @GetMapping("/{id}")
    public ApiResponse<Ticket> getTicket(@PathVariable Integer id) {
        return ApiResponse.success(ticketService.getTicket(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<Ticket> updateTicket(@PathVariable Integer id, @RequestBody Ticket updates) {
        // In a real app, strictly check permissions (Admin or owner)
        return ApiResponse.success(ticketService.updateTicket(id, updates));
    }

    @PostMapping("/webhook/sepay")
    public ApiResponse<String> handleSePayWebhook(@RequestBody SePayWebhookDTO payload) {
        paymentService.processSePayWebhook(payload);
        return ApiResponse.success("Webhook processed");
    }

    @GetMapping("/payment/status/{id}")
    public ApiResponse<TicketStatus> checkPaymentStatus(@PathVariable Integer id) {
        Ticket ticket = ticketService.getTicket(id);
        return ApiResponse.success(ticket.getStatus());
    }
}
