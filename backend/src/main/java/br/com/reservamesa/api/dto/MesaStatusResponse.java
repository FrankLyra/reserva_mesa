package br.com.reservamesa.api.dto;

import java.time.LocalDate;
import java.util.List;

public record MesaStatusResponse(
    Long mesaId,
    Integer numeroMesa,
    String status,
    List<LocalDate> datasOcupadas
) {
}
