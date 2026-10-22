package com.autobridge.security;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Very small token store: login issues a random bearer token that is kept in memory.
 * Restarting the backend invalidates all tokens (users simply sign in again).
 */
@Service
public class TokenService {

    private final Map<String, Long> tokens = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public String issue(Long userId) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        tokens.put(token, userId);
        return token;
    }

    public Optional<Long> resolve(String token) {
        if (token == null || token.isBlank()) return Optional.empty();
        return Optional.ofNullable(tokens.get(token));
    }

    public void revoke(String token) {
        if (token != null) tokens.remove(token);
    }
}
