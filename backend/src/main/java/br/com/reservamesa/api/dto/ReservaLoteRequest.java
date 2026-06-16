package br.com.reservamesa.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ReservaLoteRequest(
    @NotNull Long usuarioId,
    @NotEmpty List<@Valid ReservaItemRequest> itens
) {
}
