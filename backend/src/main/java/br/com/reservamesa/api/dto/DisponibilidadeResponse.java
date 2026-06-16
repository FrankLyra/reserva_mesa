package br.com.reservamesa.api.dto;

import java.time.LocalDate;
import java.util.List;

public record DisponibilidadeResponse(
    boolean disponivel,
    List<LocalDate> datasConflitantes
) {
}
