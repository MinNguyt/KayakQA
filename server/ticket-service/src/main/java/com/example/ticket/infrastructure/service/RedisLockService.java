package com.example.ticket.infrastructure.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Service for handling Redis-based distributed locks for seat reservations.
 * Includes graceful degradation when Redis is unavailable.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RedisLockService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String LOCK_PREFIX = "seat_lock:";

    /**
     * Attempts to acquire a distributed lock for a seat.
     * Returns true if lock acquired or if Redis is unavailable (graceful
     * degradation).
     */
    public boolean tryLock(Integer scheduleId, Integer seatId, long durationInMinutes) {
        String key = LOCK_PREFIX + scheduleId + ":" + seatId;
        log.info("Attempting to acquire lock for key: {}", key);

        try {
            Boolean success = redisTemplate.opsForValue().setIfAbsent(key, "LOCKED",
                    Duration.ofMinutes(durationInMinutes));

            if (Boolean.TRUE.equals(success)) {
                log.info("Lock acquired for key: {}", key);
                return true;
            } else {
                log.warn("Failed to acquire lock for key: {} - seat may be locked by another user", key);
                return false;
            }
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis unavailable, proceeding without distributed lock (degraded mode): {}", e.getMessage());
            // In degraded mode, we rely on database constraints to prevent double booking
            return true;
        } catch (Exception e) {
            log.error("Unexpected error acquiring Redis lock: {}", e.getMessage());
            // Fail gracefully - allow operation to proceed
            return true;
        }
    }

    /**
     * Releases the distributed lock for a seat.
     * Silently handles Redis unavailability.
     */
    public void releaseLock(Integer scheduleId, Integer seatId) {
        String key = LOCK_PREFIX + scheduleId + ":" + seatId;
        log.info("Releasing lock for key: {}", key);

        try {
            redisTemplate.delete(key);
            log.debug("Lock released for key: {}", key);
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis unavailable, cannot release lock (degraded mode): {}", e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error releasing Redis lock: {}", e.getMessage());
        }
    }

    /**
     * Checks if a seat is currently locked.
     * Returns false if Redis is unavailable (cannot determine lock status).
     */
    public boolean isLocked(Integer scheduleId, Integer seatId) {
        String key = LOCK_PREFIX + scheduleId + ":" + seatId;

        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis unavailable, assuming seat is not locked (degraded mode): {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("Unexpected error checking Redis lock: {}", e.getMessage());
            return false;
        }
    }
}
