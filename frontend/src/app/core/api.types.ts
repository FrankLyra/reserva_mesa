export type TipoAluguel = 'MIN_UM_DIA' | 'TODOS_OS_DIAS';
export type MesaStatus = 'LIVRE' | 'PARCIAL' | 'OCUPADA';
export type StatusPagamento = 'PENDENTE' | 'PAGO' | 'CANCELADO';
export type TipoUsuario = 'MORADOR' | 'CONVIDADO';
export type SetorMesa = 'AMARELO' | 'VERMELHO' | 'AZUL' | 'VERDE';

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  tipoUsuario: TipoUsuario;
  blocoApartamento?: string;
  setorMesa: SetorMesa;
}

export interface EventoRequest {
  nome: string;
  dataInicio: string;
  dataFim: string;
  descricao: string;
  quantidadeMesas: number;
  setores: {
    amarelo: number;
    vermelho: number;
    azul: number;
    verde: number;
  };
  tipoAluguel: TipoAluguel;
  precoPorDia: number;
}

export interface Evento {
  id: number;
  nome: string;
  dataInicio: string;
  dataFim: string;
  descricao: string;
  quantidadeMesas: number;
  tipoAluguel: TipoAluguel;
  precoPorDia: number;
  diasEvento: string[];
}

export interface MesaStatusResponse {
  mesaId: number;
  numeroMesa: number;
  setor: SetorMesa;
  status: MesaStatus;
  datasOcupadas: string[];
}

export interface DisponibilidadeResponse {
  disponivel: boolean;
  datasConflitantes: string[];
}

export interface ReservaResponse {
  id: number;
  mesaId: number;
  numeroMesa: number;
  usuarioId: number;
  datasReservadas: string[];
  valorTotal: number;
  statusPagamento: StatusPagamento;
  pixCopiaECola: string;
  pixExpiraEm: string;
}

export interface ReservaItemRequest {
  mesaId: number;
  datasReservadas: string[];
}

export interface ReservaLoteResponse {
  reservas: ReservaResponse[];
  valorTotal: number;
  pixCopiaECola: string;
  pixExpiraEm: string;
}

export interface AdminReservaResponse {
  id: number;
  eventoId: number;
  eventoNome: string;
  mesaId: number;
  numeroMesa: number;
  usuarioId: number;
  usuarioNome: string;
  usuarioEmail: string;
  datasReservadas: string[];
  valorTotal: number;
  statusPagamento: StatusPagamento;
  pixCopiaECola: string;
  pixExpiraEm: string;
  criadaEm: string;
}
