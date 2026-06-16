package br.com.reservamesa.repository;

import br.com.reservamesa.domain.entity.Reserva;
import br.com.reservamesa.domain.enums.StatusPagamento;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select distinct r
        from Reserva r
        join r.datasReservadas d
        where r.mesa.id = :mesaId
          and d in :datas
          and (
            r.statusPagamento = br.com.reservamesa.domain.enums.StatusPagamento.PAGO
            or (r.statusPagamento = br.com.reservamesa.domain.enums.StatusPagamento.PENDENTE and r.pixExpiraEm > :agora)
          )
    """)
    List<Reserva> findReservasAtivasComLock(
        @Param("mesaId") Long mesaId,
        @Param("datas") Collection<LocalDate> datas,
        @Param("agora") LocalDateTime agora
    );

    @Query("""
        select distinct r
        from Reserva r
        join r.datasReservadas d
        where r.mesa.evento.id = :eventoId
          and r.statusPagamento in :status
          and d between :inicio and :fim
          and (
            r.statusPagamento = br.com.reservamesa.domain.enums.StatusPagamento.PAGO
            or r.pixExpiraEm > :agora
          )
    """)
    List<Reserva> findOcupacoesEvento(
        @Param("eventoId") Long eventoId,
        @Param("inicio") LocalDate inicio,
        @Param("fim") LocalDate fim,
        @Param("status") Collection<StatusPagamento> status,
        @Param("agora") LocalDateTime agora
    );
}
