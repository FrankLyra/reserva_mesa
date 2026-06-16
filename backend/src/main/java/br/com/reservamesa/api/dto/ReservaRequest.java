package br.com.reservamesa.api.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record ReservaRequest(
    @NotNull Long mesaId,
    @NotNull Long usuarioId,
    @NotEmpty List<LocalDate> datasReservadas
) {
}
