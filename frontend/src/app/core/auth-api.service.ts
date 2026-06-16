import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { RegisterRequest } from './api.types';
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
  private readonly tokenKey = 'reserva_mesas_token';
  private readonly userKey = 'reserva_mesas_user';

  constructor(private readonly http: HttpClient) {}

  login(email: string, senha: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, senha })
      .pipe(tap(response => this.salvarSessao(response)));
  }

  registrar(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request)
      .pipe(tap(response => this.salvarSessao(response)));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  usuarioAtual(): AuthResponse | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) as AuthResponse : null;
  }

  estaAutenticado(): boolean {
    return Boolean(this.token());
  }

  isAdmin(): boolean {
    return this.usuarioAtual()?.role === 'ADMIN';
  }

  private salvarSessao(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response));
  }
}
