import { Routes } from '@angular/router';
import { MesaSelecaoComponent } from './features/mesa-selecao/mesa-selecao.component';

export const routes: Routes = [
  { path: '', component: MesaSelecaoComponent },
  { path: '**', redirectTo: '' }
];
