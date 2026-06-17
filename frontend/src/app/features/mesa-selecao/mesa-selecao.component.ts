import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  AdminReservaResponse,
  Evento,
  MesaStatusResponse,
  ReservaLoteResponse,
  SetorMesa,
  StatusPagamento
} from '../../core/api.types';
import { AuthApiService } from '../../core/auth-api.service';
import { ReservaApiService } from '../../core/reserva-api.service';

type DiaStatus = 'OCUPADO' | 'DISPONIVEL' | 'SELECIONADO';

interface CarrinhoItem {
  mesaId: number;
  numeroMesa: number;
  datasReservadas: string[];
  valorTotal: number;
}

@Component({
  selector: 'app-mesa-selecao',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './mesa-selecao.component.html',
  styleUrl: './mesa-selecao.component.css'
})
export class MesaSelecaoComponent implements OnInit, OnDestroy {
  setores: SetorMesa[] = ['AMARELO', 'VERMELHO', 'AZUL', 'VERDE'];
  eventos: Evento[] = [];
  eventoSelecionado?: Evento;
  mesas: MesaStatusResponse[] = [];
  reservasAdmin: AdminReservaResponse[] = [];
  filtroStatus: StatusPagamento | 'TODAS' = 'TODAS';
  mesaSelecionada?: MesaStatusResponse;
  datasSelecionadas = new Set<string>();
  carrinho: CarrinhoItem[] = [];
  reservaPix?: ReservaLoteResponse;
  mensagem = '';
  carregando = true;
  verificando = false;
  reservaEmAcao?: number;
  segundosPix = 0;
  private timerId?: number;

  constructor(
    private readonly reservaApi: ReservaApiService,
    private readonly authApi: AuthApiService,
    private readonly router: Router
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
    this.carrinho = [];
    this.carregarMesas(evento.id);
    this.carregarReservasAdmin();
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

  adicionarAoCarrinho(): void {
    if (!this.mesaSelecionada || this.datasSelecionadas.size === 0) {
      this.mensagem = 'Selecione ao menos uma data disponivel.';
      return;
    }

    const item: CarrinhoItem = {
      mesaId: this.mesaSelecionada.mesaId,
      numeroMesa: this.mesaSelecionada.numeroMesa,
      datasReservadas: this.datasOrdenadas(),
      valorTotal: this.total()
    };
    this.carrinho = [
      ...this.carrinho.filter(atual => atual.mesaId !== item.mesaId),
      item
    ].sort((a, b) => a.numeroMesa - b.numeroMesa);
    this.datasSelecionadas.clear();
    this.mensagem = `Mesa ${item.numeroMesa} adicionada ao carrinho.`;
  }

  removerDoCarrinho(mesaId: number): void {
    this.carrinho = this.carrinho.filter(item => item.mesaId !== mesaId);
  }

  verificarEContinuar(): void {
    if (this.carrinho.length === 0) {
      this.mensagem = 'Adicione ao menos uma mesa ao carrinho.';
      return;
    }

    const usuarioId = this.authApi.usuarioAtual()?.usuarioId;
    if (!usuarioId) {
      this.router.navigate(['/login']);
      return;
    }

    this.verificando = true;
    this.reservaApi.criarReservasLote(usuarioId, this.carrinho.map(item => ({
      mesaId: item.mesaId,
      datasReservadas: item.datasReservadas
    }))).pipe(
      catchError((error: HttpErrorResponse) => {
        const conflitos = this.extrairConflitos(error);
        if (conflitos.length > 0) {
          this.aplicarConflitos(conflitos);
          this.carrinho = this.carrinho
            .map(item => ({
              ...item,
              datasReservadas: item.datasReservadas.filter(data => !conflitos.includes(data))
            }))
            .filter(item => item.datasReservadas.length > 0)
            .map(item => ({
              ...item,
              valorTotal: (this.eventoSelecionado?.precoPorDia ?? 0) * item.datasReservadas.length
            }));
          this.mensagem = 'Uma ou mais datas acabaram de ser reservadas por outro usuario. Revise o carrinho.';
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
      this.carrinho = [];
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
    return `mesa setor-${mesa.setor.toLowerCase()} mesa-${mesa.status.toLowerCase()}`;
  }

  mesasPorSetor(setor: SetorMesa): MesaStatusResponse[] {
    return this.mesas.filter(mesa => mesa.setor === setor);
  }

  classeBlocoSetor(setor: SetorMesa): string {
    return `sector-block sector-block-${setor.toLowerCase()}`;
  }

  classeDia(data: string): string {
    return `dia dia-${this.diaStatus(data).toLowerCase()}`;
  }

  total(): number {
    return (this.eventoSelecionado?.precoPorDia ?? 0) * this.datasSelecionadas.size;
  }

  totalCarrinho(): number {
    return this.carrinho.reduce((total, item) => total + item.valorTotal, 0);
  }

  datasOrdenadas(): string[] {
    return Array.from(this.datasSelecionadas).sort();
  }

  usuarioNome(): string {
    return this.authApi.usuarioAtual()?.nome ?? '';
  }

  isAdmin(): boolean {
    return this.authApi.isAdmin();
  }

  reservasAdminFiltradas(): AdminReservaResponse[] {
    return this.reservasAdmin.filter(reserva => {
      const mesmoEvento = reserva.eventoId === this.eventoSelecionado?.id;
      const mesmoStatus = this.filtroStatus === 'TODAS' || reserva.statusPagamento === this.filtroStatus;
      return mesmoEvento && mesmoStatus;
    });
  }

  filtrarReservasAdmin(status: StatusPagamento | 'TODAS'): void {
    this.filtroStatus = status;
  }

  confirmarPagamento(reserva: AdminReservaResponse): void {
    this.reservaEmAcao = reserva.id;
    this.reservaApi.confirmarPagamento(reserva.id).subscribe({
      next: atualizada => {
        this.atualizarReservaAdmin(atualizada);
        this.reservaEmAcao = undefined;
        this.mensagem = `Pagamento da reserva #${atualizada.id} confirmado.`;
        if (this.eventoSelecionado) {
          this.carregarMesas(this.eventoSelecionado.id);
        }
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
        this.atualizarReservaAdmin(atualizada);
        this.reservaEmAcao = undefined;
        this.mensagem = `Reserva #${atualizada.id} cancelada.`;
        if (this.eventoSelecionado) {
          this.carregarMesas(this.eventoSelecionado.id);
        }
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

  sair(): void {
    this.authApi.logout();
    this.router.navigate(['/login']);
  }

  private inicializar(): void {
    if (!this.authApi.estaAutenticado()) {
      this.router.navigate(['/login']);
      return;
    }

    this.reservaApi.listarEventos().pipe(
      catchError(() => {
        this.mensagem = 'Nao foi possivel carregar os dados. Inicie o backend em http://localhost:8081.';
        return of([] as Evento[]);
      })
    ).subscribe((eventos) => {
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

  private carregarReservasAdmin(): void {
    if (!this.isAdmin()) {
      return;
    }
    this.reservaApi.listarReservasAdmin().pipe(
      catchError(() => {
        this.mensagem = 'Nao foi possivel carregar as reservas do evento.';
        return of([] as AdminReservaResponse[]);
      })
    ).subscribe(reservas => this.reservasAdmin = reservas);
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

  private abrirPix(reserva: ReservaLoteResponse): void {
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

  private atualizarReservaAdmin(atualizada: AdminReservaResponse): void {
    this.reservasAdmin = this.reservasAdmin.map(reserva => reserva.id === atualizada.id ? atualizada : reserva);
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
