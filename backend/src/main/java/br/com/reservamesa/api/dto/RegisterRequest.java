package br.com.reservamesa.api.dto;

import br.com.reservamesa.domain.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterRequest(
    @NotBlank String nome,
    @Email @NotBlank String email,
    @NotBlank String senha,
    @NotNull Role role
) {
}
