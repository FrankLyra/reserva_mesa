export type TipoAluguel = 'MIN_UM_DIA' | 'TODOS_OS_DIAS';
export type MesaStatus = 'LIVRE' | 'PARCIAL' | 'OCUPADA';

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
  statusPagamento: 'PENDENTE' | 'PAGO' | 'CANCELADO';
  pixCopiaECola: string;
  pixExpiraEm: string;
}
