package br.com.reservamesa.service;

import br.com.reservamesa.api.dto.AuthRequest;
import br.com.reservamesa.api.dto.AuthResponse;
import br.com.reservamesa.api.dto.RegisterRequest;
import br.com.reservamesa.domain.entity.Usuario;
import br.com.reservamesa.repository.UsuarioRepository;
import br.com.reservamesa.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
        UsuarioRepository usuarioRepository,
        PasswordEncoder passwordEncoder,
        AuthenticationManager authenticationManager,
        JwtService jwtService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse registrar(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("E-mail ja cadastrado");
        }

        Usuario usuario = Usuario.builder()
            .nome(request.nome())
            .email(request.email())
            .senha(passwordEncoder.encode(request.senha()))
            .role(request.role())
            .build();
        usuarioRepository.save(usuario);
        return response(usuario);
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.senha()));
        Usuario usuario = usuarioRepository.findByEmail(request.email())
            .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
        return response(usuario);
    }

    private AuthResponse response(Usuario usuario) {
        return new AuthResponse(
            jwtService.gerarToken(usuario),
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getRole()
        );
    }
}
