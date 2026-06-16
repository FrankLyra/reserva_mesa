package br.com.reservamesa.api.dto;

import br.com.reservamesa.domain.enums.TipoAluguel;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record EventoResponse(
    Long id,
    String nome,
    LocalDate dataInicio,
    LocalDate dataFim,
    String descricao,
    Integer quantidadeMesas,
    TipoAluguel tipoAluguel,
    BigDecimal precoPorDia,
    List<LocalDate> diasEvento
) {
}
