package br.com.reservamesa.api.dto;

import br.com.reservamesa.domain.enums.StatusPagamento;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ReservaResponse(
    Long id,
    Long mesaId,
    Integer numeroMesa,
    Long usuarioId,
    List<LocalDate> datasReservadas,
    BigDecimal valorTotal,
    StatusPagamento statusPagamento,
    String pixCopiaECola,
    LocalDateTime pixExpiraEm
) {
}
