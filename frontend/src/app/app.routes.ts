import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';
import { LoginComponent } from './features/login/login.component';
import { MesaSelecaoComponent } from './features/mesa-selecao/mesa-selecao.component';

export const routes: Routes = [
  { path: '', redirectTo: 'reservas', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'reservas', component: MesaSelecaoComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '**', redirectTo: 'reservas' }
];
