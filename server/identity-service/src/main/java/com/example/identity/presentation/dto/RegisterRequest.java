package com.example.identity.presentation.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String phone;
    private Integer age;
}
