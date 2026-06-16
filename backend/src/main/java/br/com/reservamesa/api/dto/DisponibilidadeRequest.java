package br.com.reservamesa.api.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record DisponibilidadeRequest(
    @NotNull Long mesaId,
    @NotEmpty List<LocalDate> datas
) {
}
