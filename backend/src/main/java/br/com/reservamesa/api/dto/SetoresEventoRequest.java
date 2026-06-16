package br.com.reservamesa.api.dto;

import jakarta.validation.constraints.Min;

public record SetoresEventoRequest(
    @Min(0) Integer amarelo,
    @Min(0) Integer vermelho,
    @Min(0) Integer azul,
    @Min(0) Integer verde
) {
}
