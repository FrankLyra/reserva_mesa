package br.com.reservamesa.config;

import br.com.reservamesa.domain.entity.Evento;
import br.com.reservamesa.domain.entity.Mesa;
import br.com.reservamesa.domain.entity.Usuario;
import br.com.reservamesa.domain.enums.Role;
import br.com.reservamesa.domain.enums.SetorMesa;
import br.com.reservamesa.domain.enums.TipoAluguel;
import br.com.reservamesa.domain.enums.TipoUsuario;
import br.com.reservamesa.repository.EventoRepository;
import br.com.reservamesa.repository.MesaRepository;
import br.com.reservamesa.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.stream.IntStream;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seed(
        UsuarioRepository usuarioRepository,
        EventoRepository eventoRepository,
        MesaRepository mesaRepository,
        PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (!usuarioRepository.existsByEmail("admin@reservas.com")) {
                usuarioRepository.save(Usuario.builder()
                    .nome("Administrador")
                    .email("admin@reservas.com")
                    .senha(passwordEncoder.encode("admin123"))
                    .telefone("(00) 00000-0000")
                    .tipoUsuario(TipoUsuario.MORADOR)
                    .blocoApartamento("Admin")
                    .setorMesa(SetorMesa.AZUL)
                    .role(Role.ADMIN)
                    .build());
            }

            if (!usuarioRepository.existsByEmail("cliente@reservas.com")) {
                usuarioRepository.save(Usuario.builder()
                    .nome("Cliente Teste")
                    .email("cliente@reservas.com")
                    .senha(passwordEncoder.encode("cliente123"))
                    .telefone("(00) 90000-0000")
                    .tipoUsuario(TipoUsuario.CONVIDADO)
                    .setorMesa(SetorMesa.VERDE)
                    .role(Role.USER)
                    .build());
            }

            if (eventoRepository.count() == 0) {
                Evento evento = eventoRepository.save(Evento.builder()
                    .nome("Feira Gastronomica 2026")
                    .descricao("Evento demonstrativo para reservas de mesas.")
                    .dataInicio(LocalDate.now().plusDays(7))
                    .dataFim(LocalDate.now().plusDays(10))
                    .quantidadeMesas(24)
                    .tipoAluguel(TipoAluguel.MIN_UM_DIA)
                    .precoPorDia(new BigDecimal("150.00"))
                    .build());

                mesaRepository.saveAll(IntStream.rangeClosed(1, evento.getQuantidadeMesas())
                    .mapToObj(numero -> Mesa.builder().numeroMesa(numero).evento(evento).build())
                    .toList());
            }
        };
    }
}
