package br.com.reservamesa.service;

import br.com.reservamesa.api.dto.DisponibilidadeResponse;
import br.com.reservamesa.api.dto.ReservaRequest;
import br.com.reservamesa.api.dto.ReservaResponse;
import br.com.reservamesa.api.error.ConflictException;
import br.com.reservamesa.domain.entity.Evento;
import br.com.reservamesa.domain.entity.Mesa;
import br.com.reservamesa.domain.entity.Reserva;
import br.com.reservamesa.domain.entity.Usuario;
import br.com.reservamesa.domain.enums.StatusPagamento;
import br.com.reservamesa.domain.enums.TipoAluguel;
import br.com.reservamesa.repository.MesaRepository;
import br.com.reservamesa.repository.ReservaRepository;
import br.com.reservamesa.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservaService {

    private final MesaRepository mesaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ReservaRepository reservaRepository;
    private final long pixExpirationMinutes;

    public ReservaService(
        MesaRepository mesaRepository,
        UsuarioRepository usuarioRepository,
        ReservaRepository reservaRepository,
        @Value("${app.pix.expiration-minutes}") long pixExpirationMinutes
    ) {
        this.mesaRepository = mesaRepository;
        this.usuarioRepository = usuarioRepository;
        this.reservaRepository = reservaRepository;
        this.pixExpirationMinutes = pixExpirationMinutes;
    }

    @Transactional(readOnly = true)
    public DisponibilidadeResponse verificarDisponibilidade(Long mesaId, Collection<LocalDate> datas) {
        List<LocalDate> datasNormalizadas = normalizarDatas(datas);
        validarDatasDaMesa(buscarMesa(mesaId), datasNormalizadas);
        List<LocalDate> conflitos = buscarDatasConflitantes(mesaId, datasNormalizadas, false);
        return new DisponibilidadeResponse(conflitos.isEmpty(), conflitos);
    }

    @Transactional
    public ReservaResponse criarReserva(ReservaRequest request) {
        Mesa mesa = buscarMesa(request.mesaId());
        Usuario usuario = usuarioRepository.findById(request.usuarioId())
            .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
        List<LocalDate> datas = normalizarDatas(request.datasReservadas());

        validarDatasDaMesa(mesa, datas);
        List<LocalDate> conflitos = buscarDatasConflitantes(mesa.getId(), datas, true);
        if (!conflitos.isEmpty()) {
            throw new ConflictException("Uma ou mais datas ja foram reservadas", conflitos);
        }

        BigDecimal valorTotal = mesa.getEvento().getPrecoPorDia().multiply(BigDecimal.valueOf(datas.size()));
        LocalDateTime agora = LocalDateTime.now();
        Reserva reserva = Reserva.builder()
            .mesa(mesa)
            .usuario(usuario)
            .datasReservadas(datas)
            .valorTotal(valorTotal)
            .statusPagamento(StatusPagamento.PENDENTE)
            .pixCopiaECola(gerarPixMock(mesa, datas, valorTotal))
            .pixExpiraEm(agora.plusMinutes(pixExpirationMinutes))
            .criadaEm(agora)
            .build();

        return toResponse(reservaRepository.save(reserva));
    }

    private Mesa buscarMesa(Long mesaId) {
        return mesaRepository.findById(mesaId)
            .orElseThrow(() -> new IllegalArgumentException("Mesa nao encontrada"));
    }

    private List<LocalDate> buscarDatasConflitantes(Long mesaId, List<LocalDate> datas, boolean lock) {
        List<Reserva> reservas = reservaRepository.findReservasAtivasComLock(mesaId, datas, LocalDateTime.now());
        return reservas.stream()
            .flatMap(reserva -> reserva.getDatasReservadas().stream())
            .filter(datas::contains)
            .distinct()
            .sorted()
            .toList();
    }

    private void validarDatasDaMesa(Mesa mesa, List<LocalDate> datas) {
        if (datas.isEmpty()) {
            throw new IllegalArgumentException("Selecione ao menos uma data");
        }

        Evento evento = mesa.getEvento();
        Set<LocalDate> diasEvento = new HashSet<>(evento.getDataInicio().datesUntil(evento.getDataFim().plusDays(1)).toList());
        if (!diasEvento.containsAll(datas)) {
            throw new IllegalArgumentException("Todas as datas devem pertencer ao periodo do evento");
        }

        if (evento.getTipoAluguel() == TipoAluguel.TODOS_OS_DIAS && datas.size() != diasEvento.size()) {
            throw new IllegalArgumentException("Este evento exige reserva para todos os dias");
        }
    }

    private List<LocalDate> normalizarDatas(Collection<LocalDate> datas) {
        return datas.stream().distinct().sorted(Comparator.naturalOrder()).toList();
    }

    private String gerarPixMock(Mesa mesa, List<LocalDate> datas, BigDecimal valorTotal) {
        return "00020126580014BR.GOV.BCB.PIX0136mesa-" + mesa.getId()
            + "-datas-" + datas.size()
            + "520400005303986540" + valorTotal
            + "5802BR5920RESERVA DE MESAS6009SAO PAULO62070503***6304MOCK";
    }

    private ReservaResponse toResponse(Reserva reserva) {
        return new ReservaResponse(
            reserva.getId(),
            reserva.getMesa().getId(),
            reserva.getMesa().getNumeroMesa(),
            reserva.getUsuario().getId(),
            reserva.getDatasReservadas(),
            reserva.getValorTotal(),
            reserva.getStatusPagamento(),
            reserva.getPixCopiaECola(),
            reserva.getPixExpiraEm()
        );
    }
}
