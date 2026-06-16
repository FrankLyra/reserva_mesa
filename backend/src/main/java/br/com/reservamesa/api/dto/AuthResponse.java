package br.com.reservamesa.api.dto;

import br.com.reservamesa.domain.enums.Role;

public record AuthResponse(
    String token,
    Long usuarioId,
    String nome,
    String email,
    Role role
) {
}
