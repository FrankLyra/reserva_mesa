package br.com.reservamesa.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ReservaLoteResponse(
    List<ReservaResponse> reservas,
    BigDecimal valorTotal,
    String pixCopiaECola,
    LocalDateTime pixExpiraEm
) {
}
