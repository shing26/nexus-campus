package com.nexus.campus.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;

@Aspect
@Component
public class LogAspect {

    private static final Logger log = LoggerFactory.getLogger(LogAspect.class);

    @Pointcut("execution(public * com.nexus.campus.controller.*.*(..))")
    public void controllerPointcut() {}

    @Before("controllerPointcut()")
    public void before(JoinPoint joinPoint) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) return;

        HttpServletRequest request = attributes.getRequest();
        log.info("[NEXUS] ==== Request ====");
        log.info("[NEXUS] URL: {} {}", request.getMethod(), request.getRequestURL());
        log.info("[NEXUS] IP: {}", request.getRemoteAddr());
        log.info("[NEXUS] Method: {}", joinPoint.getSignature().getDeclaringTypeName() + "." + joinPoint.getSignature().getName());
        log.info("[NEXUS] Args: {}", Arrays.toString(joinPoint.getArgs()));
    }

    @AfterReturning(pointcut = "controllerPointcut()", returning = "result")
    public void afterReturning(JoinPoint joinPoint, Object result) {
        log.info("[NEXUS] ==== Response ==== {}", result);
    }

    @AfterThrowing(pointcut = "controllerPointcut()", throwing = "e")
    public void afterThrowing(JoinPoint joinPoint, Exception e) {
        log.error("[NEXUS] ==== Exception ==== {} in {}: {}", e.getMessage(),
                joinPoint.getSignature().getName(), e.getCause() != null ? e.getCause().getMessage() : "");
    }
}
