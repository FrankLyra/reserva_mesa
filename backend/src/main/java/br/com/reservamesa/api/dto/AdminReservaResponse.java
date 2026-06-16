package br.com.reservamesa.api.dto;

import br.com.reservamesa.domain.enums.StatusPagamento;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record AdminReservaResponse(
    Long id,
    Long eventoId,
    String eventoNome,
    Long mesaId,
    Integer numeroMesa,
    Long usuarioId,
    String usuarioNome,
    String usuarioEmail,
    List<LocalDate> datasReservadas,
    BigDecimal valorTotal,
    StatusPagamento statusPagamento,
    String pixCopiaECola,
    LocalDateTime pixExpiraEm,
    LocalDateTime criadaEm
) {
}
