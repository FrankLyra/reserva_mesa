package br.com.reservamesa.api.error;

import java.time.LocalDate;
import java.util.List;

public class ConflictException extends RuntimeException {

    private final List<LocalDate> datasConflitantes;

    public ConflictException(String message, List<LocalDate> datasConflitantes) {
        super(message);
        this.datasConflitantes = datasConflitantes;
    }

    public List<LocalDate> getDatasConflitantes() {
        return datasConflitantes;
    }
}
