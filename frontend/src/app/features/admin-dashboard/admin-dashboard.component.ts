import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminReservaResponse, Evento, EventoRequest, StatusPagamento } from '../../core/api.types';
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
  reservas: AdminReservaResponse[] = [];
  filtroStatus: StatusPagamento | 'TODAS' = 'TODAS';
  mensagem = '';
  salvando = false;
  reservaEmAcao?: number;

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
    this.carregarReservas();
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

  reservasFiltradas(): AdminReservaResponse[] {
    if (this.filtroStatus === 'TODAS') {
      return this.reservas;
    }
    return this.reservas.filter(reserva => reserva.statusPagamento === this.filtroStatus);
  }

  filtrar(status: StatusPagamento | 'TODAS'): void {
    this.filtroStatus = status;
  }

  confirmarPagamento(reserva: AdminReservaResponse): void {
    this.reservaEmAcao = reserva.id;
    this.reservaApi.confirmarPagamento(reserva.id).subscribe({
      next: atualizada => {
        this.atualizarReserva(atualizada);
        this.reservaEmAcao = undefined;
        this.mensagem = `Pagamento da reserva #${atualizada.id} confirmado.`;
      },
      error: (error) => {
        this.reservaEmAcao = undefined;
        this.mensagem = this.mensagemErro('Nao foi possivel confirmar o pagamento.', error);
      }
    });
  }

  cancelarReserva(reserva: AdminReservaResponse): void {
    this.reservaEmAcao = reserva.id;
    this.reservaApi.cancelarReserva(reserva.id).subscribe({
      next: atualizada => {
        this.atualizarReserva(atualizada);
        this.reservaEmAcao = undefined;
        this.mensagem = `Reserva #${atualizada.id} cancelada.`;
      },
      error: (error) => {
        this.reservaEmAcao = undefined;
        this.mensagem = this.mensagemErro('Nao foi possivel cancelar a reserva.', error);
      }
    });
  }

  classeStatus(status: StatusPagamento): string {
    return `status status-${status.toLowerCase()}`;
  }

  acaoBloqueada(reserva: AdminReservaResponse): boolean {
    return this.reservaEmAcao === reserva.id;
  }

  podeCancelar(reserva: AdminReservaResponse): boolean {
    return reserva.statusPagamento !== 'CANCELADO';
  }

  private carregarEventos(): void {
    this.reservaApi.listarEventos().subscribe({
      next: eventos => this.eventos = eventos,
      error: () => this.mensagem = 'Nao foi possivel carregar os eventos.'
    });
  }

  private carregarReservas(): void {
    this.reservaApi.listarReservasAdmin().subscribe({
      next: reservas => this.reservas = reservas,
      error: () => this.mensagem = 'Nao foi possivel carregar as reservas.'
    });
  }

  private atualizarReserva(atualizada: AdminReservaResponse): void {
    this.reservas = this.reservas.map(reserva => reserva.id === atualizada.id ? atualizada : reserva);
  }

  private mensagemErro(prefixo: string, error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = error.error?.message;
      if (backendMessage) {
        return `${prefixo} Motivo: ${backendMessage}`;
      }
      if (error.status === 401 || error.status === 403) {
        return `${prefixo} Faca login novamente como administrador.`;
      }
      return `${prefixo} HTTP ${error.status}.`;
    }
    return prefixo;
  }
}
