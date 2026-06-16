package br.com.reservamesa.api.controller;

import br.com.reservamesa.api.dto.AdminReservaResponse;
import br.com.reservamesa.service.ReservaService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reservas")
public class AdminReservaController {

    private final ReservaService reservaService;

    public AdminReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping
    public List<AdminReservaResponse> listar() {
        return reservaService.listarReservasAdmin();
    }

    @PatchMapping("/{id}/confirmar-pagamento")
    public AdminReservaResponse confirmarPagamento(@PathVariable Long id) {
        return reservaService.confirmarPagamento(id);
    }

    @PatchMapping("/{id}/cancelar")
    public AdminReservaResponse cancelar(@PathVariable Long id) {
        return reservaService.cancelarReserva(id);
    }
}
