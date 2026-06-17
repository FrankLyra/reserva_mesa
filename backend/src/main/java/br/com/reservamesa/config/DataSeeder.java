package br.com.reservamesa.config;

import br.com.reservamesa.domain.entity.Usuario;
import br.com.reservamesa.domain.enums.Role;
import br.com.reservamesa.domain.enums.SetorMesa;
import br.com.reservamesa.domain.enums.TipoUsuario;
import br.com.reservamesa.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seed(
        UsuarioRepository usuarioRepository,
        PasswordEncoder passwordEncoder,
        DatabaseResetter databaseResetter,
        @Value("${app.bootstrap.admin-email:admin@reservas.com}") String adminEmail,
        @Value("${app.bootstrap.admin-password:admin123}") String adminPassword
    ) {
        return args -> {
            if (isDatabaseResetEnabled()) {
                databaseResetter.reset();
            }

            if (!usuarioRepository.existsByEmail(adminEmail)) {
                usuarioRepository.save(Usuario.builder()
                    .nome("Administrador")
                    .email(adminEmail)
                    .senha(passwordEncoder.encode(adminPassword))
                    .telefone("(00) 00000-0000")
                    .tipoUsuario(TipoUsuario.MORADOR)
                    .blocoApartamento("Admin")
                    .setorMesa(SetorMesa.AZUL)
                    .role(Role.ADMIN)
                    .build());
            }
        };
    }

    private boolean isDatabaseResetEnabled() {
        return Boolean.parseBoolean(System.getenv().getOrDefault("RESET_DATABASE_ON_START", "false"));
    }

    @Bean
    DatabaseResetter databaseResetter(JdbcTemplate jdbcTemplate) {
        return new DatabaseResetter(jdbcTemplate);
    }

    static class DatabaseResetter {

        private final JdbcTemplate jdbcTemplate;

        DatabaseResetter(JdbcTemplate jdbcTemplate) {
            this.jdbcTemplate = jdbcTemplate;
        }

        @Transactional
        void reset() {
            jdbcTemplate.execute("delete from reserva_datas");
            jdbcTemplate.execute("delete from reservas");
            jdbcTemplate.execute("delete from mesas");
            jdbcTemplate.execute("delete from eventos");
            jdbcTemplate.execute("delete from usuarios");
        }
    }
}
