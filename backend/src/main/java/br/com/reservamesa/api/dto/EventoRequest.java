package br.com.reservamesa.api.dto;

import br.com.reservamesa.domain.enums.TipoAluguel;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record EventoRequest(
    @NotBlank String nome,
    @NotNull @FutureOrPresent LocalDate dataInicio,
    @NotNull LocalDate dataFim,
    @NotBlank String descricao,
    @NotNull @Min(1) Integer quantidadeMesas,
    @NotNull TipoAluguel tipoAluguel,
    @NotNull @DecimalMin("0.01") BigDecimal precoPorDia
) {
}
