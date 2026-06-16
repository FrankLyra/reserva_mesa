package br.com.reservamesa.api.error;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ApiError(
    Instant timestamp,
    int status,
    String error,
    String message,
    List<LocalDate> datasConflitantes
) {
}
