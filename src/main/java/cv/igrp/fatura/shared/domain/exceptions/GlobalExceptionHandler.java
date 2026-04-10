package cv.igrp.fatura.shared.domain.exceptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import java.util.Arrays;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(IgrpResponseStatusException.class)
    public ProblemDetail handleIgrpResponseStatusException(IgrpResponseStatusException ex) {

        LOGGER.error(ex.getMessage(), ex);

        return ex.getBody();
    }

    @ExceptionHandler(ClassCastException.class)
    public ProblemDetail handleClassCastException(ClassCastException ex) {

        var stackTrace = ex.getStackTrace();

        var origin = stackTrace.length > 0 ? stackTrace[0] : null;

        var detailedMessage = ex.getMessage();

        if (origin != null) {
        detailedMessage += " at " + origin.getClassName() + "." + origin.getMethodName() +
        "(" + origin.getFileName() + ":" + origin.getLineNumber() + ")";
        }

        LOGGER.error("CLASS CAST EXCEPTION: {}", detailedMessage, ex);

        return ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {

        var errors = ex.getBindingResult().getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                          FieldError::getField, fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid value")
        );

        var problemDetail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problemDetail.setTitle("Validation Errors");
        problemDetail.setProperty("errors", errors);

        return problemDetail;
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ProblemDetail handleValidationException(
    HandlerMethodValidationException ex
    ) {

    var problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);

    problem.setTitle("Validation failed");
    problem.setDetail("One or more request fields are invalid");

    var errors = ex.getParameterValidationResults().stream()
    .flatMap(result -> result.getResolvableErrors().stream())
    .map(error -> {
    var map = new HashMap<String, String>();
    map.put("field", error.getCodes() != null ? error.getCodes()[0] : "unknown");
    map.put("message", error.getDefaultMessage());
    return map;
    })
    .toList();

    problem.setProperty("errors", errors);

    return problem;
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ProblemDetail handleConstraintViolationException(ConstraintViolationException ex) {

        var errors = ex.getConstraintViolations()
        .stream()
        .collect(Collectors.toMap(v -> v.getPropertyPath().toString(), ConstraintViolation::getMessage));

        var problemDetail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problemDetail.setTitle("Constraint Violation Errors");
        problemDetail.setProperty("errors", errors);

        return problemDetail;
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {

        LOGGER.error("HTTP MESSAGE NOT READABLE EXCEPTION", ex);

        var problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);

        if (ex.getCause() instanceof InvalidFormatException ife && ife.getTargetType().isEnum()) {

        var targetType = ife.getTargetType();

        var allowedValues = Arrays.stream(targetType.getEnumConstants())
        .map(Object::toString)
        .toArray(String[]::new);

        problem.setTitle("Invalid value for enum type: " + targetType.getSimpleName());
        problem.setProperty("CurrentValue", ife.getValue());
        problem.setProperty("AllowedValues", allowedValues);
        return problem;
        }

        problem.setTitle("Malformed JSON request");
        problem.setDetail(ex.getMessage());

        return problem;
    }

}