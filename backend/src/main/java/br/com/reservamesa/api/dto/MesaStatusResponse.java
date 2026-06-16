package br.com.reservamesa.api.dto;

import br.com.reservamesa.domain.enums.SetorMesa;
import java.time.LocalDate;
import java.util.List;

public record MesaStatusResponse(
    Long mesaId,
    Integer numeroMesa,
    SetorMesa setor,
    String status,
    List<LocalDate> datasOcupadas
) {
}
