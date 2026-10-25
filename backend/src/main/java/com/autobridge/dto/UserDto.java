package com.autobridge.dto;

import com.autobridge.model.Role;
import com.autobridge.model.User;

import java.time.Instant;

public record UserDto(
        Long id,
        String fullName,
        String email,
        Role role,
        Instant createdAt,
        String showroomName
) {
    public static UserDto of(User u) {
        return new UserDto(
                u.getId(),
                u.getFullName(),
                u.getEmail(),
                u.getRole(),
                u.getCreatedAt(),
                u.getShowroomName()
        );
    }
}
