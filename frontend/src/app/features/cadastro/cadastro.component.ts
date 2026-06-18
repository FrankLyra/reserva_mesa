import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TipoUsuario } from '../../core/api.types';
import { AuthApiService } from '../../core/auth-api.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  mensagem = '';
  salvando = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    nome: ['', [Validators.required]],
    telefone: ['', [Validators.required]],
    tipoUsuario: ['MORADOR' as TipoUsuario, [Validators.required]],
    blocoApartamento: ['', [Validators.required]]
  });

  tipoUsuario(): TipoUsuario {
    return this.form.controls.tipoUsuario.value;
  }

  alterarTipo(tipo: TipoUsuario): void {
    this.form.controls.tipoUsuario.setValue(tipo);
    if (tipo === 'CONVIDADO') {
      this.form.controls.blocoApartamento.clearValidators();
      this.form.controls.blocoApartamento.setValue('');
    } else {
      this.form.controls.blocoApartamento.setValidators([Validators.required]);
    }
    this.form.controls.blocoApartamento.updateValueAndValidity();
  }

  cadastrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando = true;
    this.mensagem = '';
    this.authApi.registrar(this.form.getRawValue()).subscribe({
      next: () => {
        this.salvando = false;
        this.router.navigate(['/reservas']);
      },
      error: () => {
        this.salvando = false;
        this.mensagem = 'Nao foi possivel concluir o cadastro. Verifique os dados.';
      }
    });
  }
}
