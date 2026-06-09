import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'evaluacija', pathMatch: 'full' },
  {
    path: 'evaluacija',
    loadComponent: () =>
      import('./pages/evaluator/evaluator.component').then((m) => m.EvaluatorComponent),
  },
  {
    path: 'rezultati',
    loadComponent: () =>
      import('./pages/results/results.component').then((m) => m.ResultsComponent),
  },
  { path: '**', redirectTo: 'evaluacija' },
];
