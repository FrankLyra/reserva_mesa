package br.com.reservamesa.repository;

import br.com.reservamesa.domain.entity.Mesa;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MesaRepository extends JpaRepository<Mesa, Long> {
    List<Mesa> findByEventoIdOrderByNumeroMesa(Long eventoId);
}
