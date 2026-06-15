package com.example.fleet.infrastructure.logging;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Pointcut("within(main.java.com.example.fleet.application..*) || within(main.java.com.example.fleet.presentation..*)")
    public void applicationPackagePointcut() {
    }

    @Around("applicationPackagePointcut()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();

        if (log.isDebugEnabled()) {
            log.debug("Enter: {}.{}() with arguments = {}",
                    className,
                    methodName,
                    Arrays.toString(joinPoint.getArgs()));
        }

        long startTime = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();

            long elapsedTime = System.currentTimeMillis() - startTime;

            if (log.isDebugEnabled()) {
                log.debug("Exit: {}.{}() with result = {} in {}ms",
                        className,
                        methodName,
                        result,
                        elapsedTime);
            }

            return result;

        } catch (Exception e) {
            long elapsedTime = System.currentTimeMillis() - startTime;

            log.error("Exception in {}.{}() after {}ms with cause = {}",
                    className,
                    methodName,
                    elapsedTime,
                    e.getMessage());

            throw e;
        }
    }
}
