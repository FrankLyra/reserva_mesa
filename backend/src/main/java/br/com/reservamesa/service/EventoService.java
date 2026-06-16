package br.com.reservamesa.service;

import br.com.reservamesa.api.dto.EventoRequest;
import br.com.reservamesa.api.dto.EventoResponse;
import br.com.reservamesa.domain.entity.Evento;
import br.com.reservamesa.domain.entity.Mesa;
import br.com.reservamesa.repository.EventoRepository;
import br.com.reservamesa.repository.MesaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.IntStream;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;
    private final MesaRepository mesaRepository;

    public EventoService(EventoRepository eventoRepository, MesaRepository mesaRepository) {
        this.eventoRepository = eventoRepository;
        this.mesaRepository = mesaRepository;
    }

    @Transactional
    public EventoResponse criar(EventoRequest request) {
        validarPeriodo(request.dataInicio(), request.dataFim());

        Evento evento = Evento.builder()
            .nome(request.nome())
            .dataInicio(request.dataInicio())
            .dataFim(request.dataFim())
            .descricao(request.descricao())
            .quantidadeMesas(request.quantidadeMesas())
            .tipoAluguel(request.tipoAluguel())
            .precoPorDia(request.precoPorDia())
            .build();
        eventoRepository.save(evento);

        List<Mesa> mesas = IntStream.rangeClosed(1, request.quantidadeMesas())
            .mapToObj(numero -> Mesa.builder().numeroMesa(numero).evento(evento).build())
            .toList();
        mesaRepository.saveAll(mesas);

        return toResponse(evento);
    }

    @Transactional(readOnly = true)
    public List<EventoResponse> listar() {
        return eventoRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Evento buscarEntidade(Long id) {
        return eventoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Evento nao encontrado"));
    }

    private void validarPeriodo(LocalDate inicio, LocalDate fim) {
        if (fim.isBefore(inicio)) {
            throw new IllegalArgumentException("Data final deve ser igual ou posterior a data inicial");
        }
    }

    private EventoResponse toResponse(Evento evento) {
        return new EventoResponse(
            evento.getId(),
            evento.getNome(),
            evento.getDataInicio(),
            evento.getDataFim(),
            evento.getDescricao(),
            evento.getQuantidadeMesas(),
            evento.getTipoAluguel(),
            evento.getPrecoPorDia(),
            evento.getDataInicio().datesUntil(evento.getDataFim().plusDays(1)).toList()
        );
    }
}
