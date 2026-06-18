package br.com.reservamesa.service;

import br.com.reservamesa.api.dto.EventoRequest;
import br.com.reservamesa.api.dto.EventoResponse;
import br.com.reservamesa.api.dto.SetoresEventoRequest;
import br.com.reservamesa.domain.entity.Evento;
import br.com.reservamesa.domain.entity.Mesa;
import br.com.reservamesa.domain.enums.SetorMesa;
import br.com.reservamesa.repository.EventoRepository;
import br.com.reservamesa.repository.MesaRepository;
import br.com.reservamesa.repository.ReservaRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;
    private final MesaRepository mesaRepository;
    private final ReservaRepository reservaRepository;

    public EventoService(EventoRepository eventoRepository, MesaRepository mesaRepository, ReservaRepository reservaRepository) {
        this.eventoRepository = eventoRepository;
        this.mesaRepository = mesaRepository;
        this.reservaRepository = reservaRepository;
    }

    @Transactional
    public EventoResponse criar(EventoRequest request) {
        validarPeriodo(request.dataInicio(), request.dataFim());
        validarSetores(request);

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

        List<Mesa> mesas = criarMesasPorSetor(evento, request);
        mesaRepository.saveAll(mesas);

        return toResponse(evento);
    }

    @Transactional(readOnly = true)
    public List<EventoResponse> listar() {
        return eventoRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public void excluir(Long id) {
        Evento evento = buscarEntidade(id);
        reservaRepository.deleteAll(reservaRepository.findByMesaEventoId(id));
        mesaRepository.deleteAll(mesaRepository.findByEventoIdOrderByNumeroMesa(id));
        eventoRepository.delete(evento);
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

    private void validarSetores(EventoRequest request) {
        int totalSetores = totalSetores(request.setores());
        if (totalSetores > 0 && totalSetores != request.quantidadeMesas()) {
            throw new IllegalArgumentException("A soma das mesas por setor deve ser igual a quantidade total de mesas");
        }
    }

    private List<Mesa> criarMesasPorSetor(Evento evento, EventoRequest request) {
        List<Mesa> mesas = new ArrayList<>();
        SetoresEventoRequest setores = request.setores();
        int numero = 1;
        if (totalSetores(setores) == 0) {
            for (int i = 0; i < request.quantidadeMesas(); i++) {
                mesas.add(criarMesa(evento, numero++, SetorMesa.VERDE));
            }
            return mesas;
        }

        numero = adicionarMesasSetor(mesas, evento, numero, SetorMesa.AMARELO, valorSetor(setores.amarelo()));
        numero = adicionarMesasSetor(mesas, evento, numero, SetorMesa.VERMELHO, valorSetor(setores.vermelho()));
        numero = adicionarMesasSetor(mesas, evento, numero, SetorMesa.AZUL, valorSetor(setores.azul()));
        adicionarMesasSetor(mesas, evento, numero, SetorMesa.VERDE, valorSetor(setores.verde()));
        return mesas;
    }

    private int adicionarMesasSetor(List<Mesa> mesas, Evento evento, int numeroInicial, SetorMesa setor, int quantidade) {
        int numero = numeroInicial;
        for (int i = 0; i < quantidade; i++) {
            mesas.add(criarMesa(evento, numero++, setor));
        }
        return numero;
    }

    private Mesa criarMesa(Evento evento, int numero, SetorMesa setor) {
        return Mesa.builder().numeroMesa(numero).setor(setor).evento(evento).build();
    }

    private int totalSetores(SetoresEventoRequest setores) {
        if (setores == null) {
            return 0;
        }
        return valorSetor(setores.amarelo())
            + valorSetor(setores.vermelho())
            + valorSetor(setores.azul())
            + valorSetor(setores.verde());
    }

    private int valorSetor(Integer valor) {
        return valor == null ? 0 : valor;
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
