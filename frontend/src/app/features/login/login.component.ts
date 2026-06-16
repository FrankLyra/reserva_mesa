import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../../core/auth-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  carregando = false;
  mensagem = '';

  form = this.fb.nonNullable.group({
    email: ['admin@reservas.com', [Validators.required, Validators.email]],
    senha: ['admin123', [Validators.required]]
  });

  entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregando = true;
    this.mensagem = '';
    const { email, senha } = this.form.getRawValue();
    this.authApi.login(email, senha).subscribe({
      next: (usuario) => {
        this.carregando = false;
        this.router.navigate([usuario.role === 'ADMIN' ? '/admin' : '/reservas']);
      },
      error: () => {
        this.carregando = false;
        this.mensagem = 'E-mail ou senha invalidos.';
      }
    });
  }

  usarAdmin(): void {
    this.form.setValue({ email: 'admin@reservas.com', senha: 'admin123' });
  }

  usarCliente(): void {
    this.form.setValue({ email: 'cliente@reservas.com', senha: 'cliente123' });
  }
}
