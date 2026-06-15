package com.example.identity.infrastructure.logging;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * AOP Aspect for automatic logging of method entry, exit, and exceptions.
 * Logs are generated at:
 * - DEBUG level: method entry with parameters, method exit with result
 * - ERROR level: exceptions with stack traces
 */
@Aspect
@Component
public class LoggingAspect {

    /**
     * Pointcut for all public methods in application, presentation, and service
     * layers.
     */
    @Pointcut("within(com.example.identity.application..*) || " +
            "within(com.example.identity.presentation..*)")
    public void applicationPackagePointcut() {
        // Method is empty as this is just a Pointcut definition
    }

    /**
     * Logs method entry, execution time, and exit.
     */
    @Around("applicationPackagePointcut()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        Logger log = LoggerFactory.getLogger(joinPoint.getSignature().getDeclaringType());
        String methodName = joinPoint.getSignature().getName();

        // Log method entry with parameters (masking sensitive data)
        if (log.isDebugEnabled()) {
            Object[] args = joinPoint.getArgs();
            String params = formatParameters(args);
            log.debug(">>> {}() called with: {}", methodName, params);
        }

        long startTime = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long executionTime = System.currentTimeMillis() - startTime;

        // Log method exit with result summary
        if (log.isDebugEnabled()) {
            String resultSummary = formatResult(result);
            log.debug("<<< {}() completed in {}ms, returned: {}", methodName, executionTime, resultSummary);
        }

        return result;
    }

    /**
     * Logs exceptions thrown by methods.
     */
    @AfterThrowing(pointcut = "applicationPackagePointcut()", throwing = "exception")
    public void logException(JoinPoint joinPoint, Throwable exception) {
        Logger log = LoggerFactory.getLogger(joinPoint.getSignature().getDeclaringType());
        String methodName = joinPoint.getSignature().getName();

        log.error("!!! {}() threw exception: {} - {}",
                methodName,
                exception.getClass().getSimpleName(),
                exception.getMessage());
    }

    /**
     * Formats parameters, masking sensitive data like passwords.
     */
    private String formatParameters(Object[] args) {
        if (args == null || args.length == 0) {
            return "[]";
        }
        return Arrays.stream(args)
                .map(this::maskSensitiveData)
                .toList()
                .toString();
    }

    /**
     * Masks sensitive fields in objects.
     */
    private String maskSensitiveData(Object obj) {
        if (obj == null) {
            return "null";
        }
        String className = obj.getClass().getSimpleName().toLowerCase();
        // Mask request objects that may contain passwords
        if (className.contains("login") || className.contains("register") || className.contains("password")) {
            return obj.getClass().getSimpleName() + "[MASKED]";
        }
        return obj.toString();
    }

    /**
     * Formats return value, truncating if too long.
     */
    private String formatResult(Object result) {
        if (result == null) {
            return "null";
        }
        String resultStr = result.toString();
        if (resultStr.length() > 100) {
            return resultStr.substring(0, 100) + "...[truncated]";
        }
        return resultStr;
    }
}
