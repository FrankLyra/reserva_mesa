import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Evento, EventoRequest } from '../../core/api.types';
import { AuthApiService } from '../../core/auth-api.service';
import { ReservaApiService } from '../../core/reserva-api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reservaApi = inject(ReservaApiService);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  eventos: Evento[] = [];
  mensagem = '';
  salvando = false;

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required]],
    dataInicio: ['', [Validators.required]],
    dataFim: ['', [Validators.required]],
    descricao: ['', [Validators.required]],
    quantidadeMesas: [20, [Validators.required, Validators.min(1)]],
    tipoAluguel: ['MIN_UM_DIA' as const, [Validators.required]],
    precoPorDia: [150, [Validators.required, Validators.min(0.01)]]
  });

  ngOnInit(): void {
    if (!this.authApi.estaAutenticado()) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.authApi.isAdmin()) {
      this.router.navigate(['/reservas']);
      return;
    }
    this.carregarEventos();
  }

  criarEvento(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando = true;
    this.mensagem = '';
    const request = this.form.getRawValue() as EventoRequest;
    this.reservaApi.criarEvento(request).subscribe({
      next: (evento) => {
        this.eventos = [evento, ...this.eventos];
        this.salvando = false;
        this.mensagem = 'Evento criado com sucesso.';
        this.form.reset({
          nome: '',
          dataInicio: '',
          dataFim: '',
          descricao: '',
          quantidadeMesas: 20,
          tipoAluguel: 'MIN_UM_DIA',
          precoPorDia: 150
        });
      },
      error: () => {
        this.salvando = false;
        this.mensagem = 'Nao foi possivel criar o evento. Confira os dados e tente novamente.';
      }
    });
  }

  usuarioNome(): string {
    return this.authApi.usuarioAtual()?.nome ?? 'Admin';
  }

  sair(): void {
    this.authApi.logout();
    this.router.navigate(['/login']);
  }

  private carregarEventos(): void {
    this.reservaApi.listarEventos().subscribe({
      next: eventos => this.eventos = eventos,
      error: () => this.mensagem = 'Nao foi possivel carregar os eventos.'
    });
  }
}
