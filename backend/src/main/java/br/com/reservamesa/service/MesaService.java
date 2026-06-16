package br.com.reservamesa.service;

import br.com.reservamesa.api.dto.MesaStatusResponse;
import br.com.reservamesa.domain.entity.Evento;
import br.com.reservamesa.domain.entity.Mesa;
import br.com.reservamesa.domain.entity.Reserva;
import br.com.reservamesa.domain.enums.StatusPagamento;
import br.com.reservamesa.repository.MesaRepository;
import br.com.reservamesa.repository.ReservaRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MesaService {

    private final MesaRepository mesaRepository;
    private final ReservaRepository reservaRepository;
    private final EventoService eventoService;

    public MesaService(MesaRepository mesaRepository, ReservaRepository reservaRepository, EventoService eventoService) {
        this.mesaRepository = mesaRepository;
        this.reservaRepository = reservaRepository;
        this.eventoService = eventoService;
    }

    @Transactional(readOnly = true)
    public List<MesaStatusResponse> listarStatusPorEvento(Long eventoId) {
        Evento evento = eventoService.buscarEntidade(eventoId);
        List<LocalDate> diasEvento = evento.getDataInicio().datesUntil(evento.getDataFim().plusDays(1)).toList();
        List<Mesa> mesas = mesaRepository.findByEventoIdOrderByNumeroMesa(eventoId);
        List<Reserva> reservas = reservaRepository.findOcupacoesEvento(
            eventoId,
            evento.getDataInicio(),
            evento.getDataFim(),
            EnumSet.of(StatusPagamento.PENDENTE, StatusPagamento.PAGO),
            LocalDateTime.now()
        );

        Map<Long, Set<LocalDate>> ocupacoesPorMesa = reservas.stream()
            .collect(Collectors.groupingBy(
                reserva -> reserva.getMesa().getId(),
                Collectors.flatMapping(reserva -> reserva.getDatasReservadas().stream(), Collectors.toSet())
            ));
        Set<Long> mesasPagas = reservas.stream()
            .filter(reserva -> reserva.getStatusPagamento() == StatusPagamento.PAGO)
            .map(reserva -> reserva.getMesa().getId())
            .collect(Collectors.toSet());

        return mesas.stream()
            .map(mesa -> {
                List<LocalDate> ocupadas = diasEvento.stream()
                    .filter(dia -> ocupacoesPorMesa.getOrDefault(mesa.getId(), Set.of()).contains(dia))
                    .toList();
                return new MesaStatusResponse(
                    mesa.getId(),
                    mesa.getNumeroMesa(),
                    calcularStatus(ocupadas.size(), diasEvento.size(), mesasPagas.contains(mesa.getId())),
                    ocupadas
                );
            })
            .toList();
    }

    private String calcularStatus(int ocupadas, int totalDias, boolean temPagamentoConfirmado) {
        if (ocupadas == 0) {
            return "LIVRE";
        }
        if (temPagamentoConfirmado || ocupadas == totalDias) {
            return "OCUPADA";
        }
        return "PARCIAL";
    }
}
