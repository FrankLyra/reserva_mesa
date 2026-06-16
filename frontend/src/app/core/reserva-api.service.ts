import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './environment';
import { DisponibilidadeResponse, Evento, MesaStatusResponse, ReservaResponse } from './api.types';

@Injectable({ providedIn: 'root' })
export class ReservaApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  listarEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/eventos`);
  }

  listarMesas(eventoId: number): Observable<MesaStatusResponse[]> {
    return this.http.get<MesaStatusResponse[]>(`${this.apiUrl}/mesas/evento/${eventoId}/status`);
  }

  verificarDisponibilidade(mesaId: number, datas: string[]): Observable<DisponibilidadeResponse> {
    return this.http.post<DisponibilidadeResponse>(`${this.apiUrl}/reservas/verificar-disponibilidade`, {
      mesaId,
      datas
    });
  }

  criarReserva(mesaId: number, usuarioId: number, datasReservadas: string[]): Observable<ReservaResponse> {
    return this.http.post<ReservaResponse>(`${this.apiUrl}/reservas`, {
      mesaId,
      usuarioId,
      datasReservadas
    });
  }
}
