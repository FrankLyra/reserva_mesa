import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Evento, MesaStatusResponse, ReservaResponse } from '../../core/api.types';
import { AuthApiService } from '../../core/auth-api.service';
import { environment } from '../../core/environment';
import { ReservaApiService } from '../../core/reserva-api.service';

type DiaStatus = 'OCUPADO' | 'DISPONIVEL' | 'SELECIONADO';

@Component({
  selector: 'app-mesa-selecao',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './mesa-selecao.component.html',
  styleUrl: './mesa-selecao.component.css'
})
export class MesaSelecaoComponent implements OnInit, OnDestroy {
  eventos: Evento[] = [];
  eventoSelecionado?: Evento;
  mesas: MesaStatusResponse[] = [];
  mesaSelecionada?: MesaStatusResponse;
  datasSelecionadas = new Set<string>();
  reservaPix?: ReservaResponse;
  mensagem = '';
  carregando = true;
  verificando = false;
  segundosPix = 0;
  private timerId?: number;

  constructor(
    private readonly reservaApi: ReservaApiService,
    private readonly authApi: AuthApiService
  ) {}

  ngOnInit(): void {
    this.inicializar();
  }

  ngOnDestroy(): void {
    this.pararTimer();
  }

  selecionarEvento(evento: Evento): void {
    this.eventoSelecionado = evento;
    this.mesaSelecionada = undefined;
    this.datasSelecionadas.clear();
    this.carregarMesas(evento.id);
  }

  selecionarMesa(mesa: MesaStatusResponse): void {
    this.mesaSelecionada = mesa;
    this.datasSelecionadas.clear();
    this.reservaPix = undefined;
    this.mensagem = '';
  }

  alternarData(data: string): void {
    if (!this.mesaSelecionada || this.diaStatus(data) === 'OCUPADO') {
      return;
    }

    if (this.eventoSelecionado?.tipoAluguel === 'TODOS_OS_DIAS') {
      this.datasSelecionadas = new Set(this.diasDisponiveis());
      return;
    }

    if (this.datasSelecionadas.has(data)) {
      this.datasSelecionadas.delete(data);
    } else {
      this.datasSelecionadas.add(data);
    }
  }

  verificarEContinuar(): void {
    if (!this.mesaSelecionada || this.datasSelecionadas.size === 0) {
      this.mensagem = 'Selecione ao menos uma data disponivel.';
      return;
    }

    this.verificando = true;
    const datas = this.datasOrdenadas();
    this.reservaApi.verificarDisponibilidade(this.mesaSelecionada.mesaId, datas).pipe(
      switchMap(response => {
        if (!response.disponivel) {
          this.aplicarConflitos(response.datasConflitantes);
          this.mensagem = this.mensagemConflito(response.datasConflitantes);
          return of(undefined);
        }
        return this.reservaApi.criarReserva(this.mesaSelecionada!.mesaId, environment.clienteTesteId, datas);
      }),
      catchError((error: HttpErrorResponse) => {
        const conflitos = this.extrairConflitos(error);
        if (conflitos.length > 0) {
          this.aplicarConflitos(conflitos);
          this.mensagem = this.mensagemConflito(conflitos);
        } else {
          this.mensagem = 'Nao foi possivel concluir a reserva. Verifique o backend e tente novamente.';
        }
        return of(undefined);
      })
    ).subscribe(reserva => {
      this.verificando = false;
      if (reserva) {
        this.abrirPix(reserva);
      }
    });
  }

  copiarPix(): void {
    if (!this.reservaPix) {
      return;
    }
    navigator.clipboard.writeText(this.reservaPix.pixCopiaECola)
      .then(() => this.mensagem = 'Codigo PIX copiado.')
      .catch(() => this.mensagem = 'Nao foi possivel copiar automaticamente.');
  }

  fecharPix(): void {
    this.reservaPix = undefined;
    this.pararTimer();
    if (this.eventoSelecionado) {
      this.carregarMesas(this.eventoSelecionado.id);
    }
  }

  diaStatus(data: string): DiaStatus {
    if (this.mesaSelecionada?.datasOcupadas.includes(data)) {
      return 'OCUPADO';
    }
    if (this.datasSelecionadas.has(data)) {
      return 'SELECIONADO';
    }
    return 'DISPONIVEL';
  }

  classeMesa(mesa: MesaStatusResponse): string {
    return `mesa mesa-${mesa.status.toLowerCase()}`;
  }

  classeDia(data: string): string {
    return `dia dia-${this.diaStatus(data).toLowerCase()}`;
  }

  total(): number {
    return (this.eventoSelecionado?.precoPorDia ?? 0) * this.datasSelecionadas.size;
  }

  datasOrdenadas(): string[] {
    return Array.from(this.datasSelecionadas).sort();
  }

  gridColumns(): number {
    return Math.min(6, Math.max(2, Math.ceil(Math.sqrt(this.mesas.length || 1))));
  }

  private inicializar(): void {
    const auth$ = localStorage.getItem('reserva_mesas_token') ? of(null) : this.authApi.loginClienteTeste();
    auth$.pipe(
      switchMap(() => forkJoin({
        eventos: this.reservaApi.listarEventos()
      })),
      catchError(() => {
        this.mensagem = 'Nao foi possivel carregar os dados. Inicie o backend em http://localhost:8080.';
        return of({ eventos: [] as Evento[] });
      })
    ).subscribe(({ eventos }) => {
      this.eventos = eventos;
      this.carregando = false;
      if (eventos.length > 0) {
        this.selecionarEvento(eventos[0]);
      }
    });
  }

  private carregarMesas(eventoId: number): void {
    this.reservaApi.listarMesas(eventoId).pipe(
      catchError(() => {
        this.mensagem = 'Nao foi possivel carregar as mesas do evento.';
        return of([] as MesaStatusResponse[]);
      })
    ).subscribe(mesas => this.mesas = mesas);
  }

  private diasDisponiveis(): string[] {
    if (!this.eventoSelecionado || !this.mesaSelecionada) {
      return [];
    }
    return this.eventoSelecionado.diasEvento.filter(data => !this.mesaSelecionada!.datasOcupadas.includes(data));
  }

  private aplicarConflitos(datas: string[]): void {
    if (!this.mesaSelecionada) {
      return;
    }
    const ocupadas = new Set([...this.mesaSelecionada.datasOcupadas, ...datas]);
    datas.forEach(data => this.datasSelecionadas.delete(data));
    this.mesaSelecionada = {
      ...this.mesaSelecionada,
      datasOcupadas: Array.from(ocupadas).sort(),
      status: this.recalcularStatus(ocupadas.size)
    };
    this.mesas = this.mesas.map(mesa => mesa.mesaId === this.mesaSelecionada?.mesaId ? this.mesaSelecionada : mesa);
  }

  private recalcularStatus(ocupadas: number): 'LIVRE' | 'PARCIAL' | 'OCUPADA' {
    const totalDias = this.eventoSelecionado?.diasEvento.length ?? 0;
    if (ocupadas === 0) {
      return 'LIVRE';
    }
    return ocupadas >= totalDias ? 'OCUPADA' : 'PARCIAL';
  }

  private mensagemConflito(datas: string[]): string {
    const primeiraData = datas[0] ?? '';
    const mesa = this.mesaSelecionada?.numeroMesa ?? '';
    return `Atencao: a data ${primeiraData} para a mesa ${mesa} acabou de ser reservada por outro usuario.`;
  }

  private extrairConflitos(error: HttpErrorResponse): string[] {
    const conflitos = error.error?.datasConflitantes;
    return Array.isArray(conflitos) ? conflitos : [];
  }

  private abrirPix(reserva: ReservaResponse): void {
    this.reservaPix = reserva;
    this.mensagem = 'Reserva criada. Pague com PIX antes do prazo expirar.';
    this.segundosPix = Math.max(1, Math.floor((new Date(reserva.pixExpiraEm).getTime() - Date.now()) / 1000));
    this.pararTimer();
    this.timerId = window.setInterval(() => {
      this.segundosPix = Math.max(0, this.segundosPix - 1);
      if (this.segundosPix === 0) {
        this.pararTimer();
      }
    }, 1000);
  }

  private pararTimer(): void {
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }
}
