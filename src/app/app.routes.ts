import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/pages/home').then((m) => m.Home),
  },
  {
    path: 'canvas',
    loadComponent: () =>
      import('./features/canvas/pages/canvas').then((m) => m.Canvas),
  },
];
