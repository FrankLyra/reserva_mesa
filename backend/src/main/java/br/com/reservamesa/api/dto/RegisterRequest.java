package br.com.reservamesa.api.dto;

import br.com.reservamesa.domain.enums.Role;
import br.com.reservamesa.domain.enums.SetorMesa;
import br.com.reservamesa.domain.enums.TipoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterRequest(
    @NotBlank String nome,
    @Email @NotBlank String email,
    @NotBlank String senha,
    @NotBlank String telefone,
    @NotNull TipoUsuario tipoUsuario,
    String blocoApartamento,
    SetorMesa setorMesa,
    Role role
) {
}
