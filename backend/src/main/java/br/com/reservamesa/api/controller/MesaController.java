package br.com.reservamesa.api.controller;

import br.com.reservamesa.api.dto.MesaStatusResponse;
import br.com.reservamesa.service.MesaService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mesas")
public class MesaController {

    private final MesaService mesaService;

    public MesaController(MesaService mesaService) {
        this.mesaService = mesaService;
    }

    @GetMapping("/evento/{eventoId}/status")
    public List<MesaStatusResponse> listarStatus(@PathVariable Long eventoId) {
        return mesaService.listarStatusPorEvento(eventoId);
    }
}
