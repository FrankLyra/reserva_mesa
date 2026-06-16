package br.com.reservamesa.api.controller;

import br.com.reservamesa.api.dto.DisponibilidadeRequest;
import br.com.reservamesa.api.dto.DisponibilidadeResponse;
import br.com.reservamesa.api.dto.ReservaLoteRequest;
import br.com.reservamesa.api.dto.ReservaLoteResponse;
import br.com.reservamesa.api.dto.ReservaRequest;
import br.com.reservamesa.api.dto.ReservaResponse;
import br.com.reservamesa.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @PostMapping("/verificar-disponibilidade")
    public DisponibilidadeResponse verificar(@Valid @RequestBody DisponibilidadeRequest request) {
        return reservaService.verificarDisponibilidade(request.mesaId(), request.datas());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservaResponse criar(@Valid @RequestBody ReservaRequest request) {
        return reservaService.criarReserva(request);
    }

    @PostMapping("/lote")
    @ResponseStatus(HttpStatus.CREATED)
    public ReservaLoteResponse criarLote(@Valid @RequestBody ReservaLoteRequest request) {
        return reservaService.criarReservasLote(request);
    }
}
