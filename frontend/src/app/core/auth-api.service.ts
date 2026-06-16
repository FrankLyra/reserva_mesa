import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from './environment';

export interface AuthResponse {
  token: string;
  usuarioId: number;
  nome: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  loginClienteTeste(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
      email: 'cliente@reservas.com',
      senha: 'cliente123'
    }).pipe(tap(response => localStorage.setItem('reserva_mesas_token', response.token)));
  }
}
