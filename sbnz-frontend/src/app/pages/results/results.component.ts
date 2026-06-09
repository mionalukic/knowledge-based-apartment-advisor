import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ComfortClass, EvaluationResponse, BackwardQueryResponse } from '../../models/apartment.models';
import { ResultsService } from '../../services/results.service';

@Component({
  selector: 'app-results',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css',
  standalone: true
})
export class ResultsComponent {
  private resultsService = inject(ResultsService);
  private router = inject(Router);

  resultType = this.resultsService.resultType;
  evaluation = this.resultsService.evaluationResult;
  backward = this.resultsService.backwardResult;

  comfortLabel = computed(() => {
    const r = this.evaluation();
    if (!r) return '';
    const labels: Record<ComfortClass, string> = {
      A: 'Odlično',
      B: 'Dobro',
      C: 'Prihvatljivo',
      D: 'Loše',
    };
    return labels[r.comfortClass];
  });

  comfortDesc = computed(() => {
    const r = this.evaluation();
    if (!r) return '';
    const descs: Record<ComfortClass, string> = {
      A: 'Stan nema prekršaja i ima najviše 2 upozorenja.',
      B: 'Stan ima manja odstupanja ili više upozorenja.',
      C: 'Stan ima 3 ili više manjih prekršaja.',
      D: 'Stan ima barem jedan kritičan prekršaj.',
    };
    return descs[r.comfortClass];
  });

  structureLabel = computed(() => {
    const r = this.evaluation();
    if (!r) return '';
    const labels: Record<string, string> = {
      STUDIO: 'Garsonjera',
      ONE_ROOM: 'Jednosoban',
      ONE_AND_A_HALF_ROOM: 'Jednoiposoban',
      TWO_ROOM: 'Dvosoban',
      TWO_AND_A_HALF_ROOM: 'Dvoiposoban',
      THREE_ROOM: 'Trosoban',
      THREE_AND_A_HALF_ROOM: 'Troiposoban',
      FOUR_ROOM: 'Četvorosoban',
      FOUR_AND_A_HALF_ROOM: 'Četvoroiposoban',
    };
    return labels[r.structure] ?? r.structure;
  });

  queryLabel = computed(() => {
    const b = this.backward();
    if (!b) return '';
    const labels: Record<string, string> = {
      potencijalZaVisokKomfor: 'Potencijal za visok komfor',
      stanPogodanZaPorodicu: 'Stan pogodan za porodicu',
    };
    return labels[b.queryName] ?? b.queryName;
  });

  newAnalysis() {
    this.resultsService.clear();
    this.router.navigate(['/evaluacija']);
  }

  hasCriticalViolations(r: EvaluationResponse): boolean {
    return r.violations?.some((v) => v.critical) ?? false;
  }

  totalRepairCost(r: EvaluationResponse): number {
    return r.violations?.reduce((sum, v) => sum + (v.estimatedRepairCost ?? 0), 0) ?? 0;
  }

  totalExtraCost(r: EvaluationResponse): number {
    return r.warnings?.reduce((sum, w) => sum + (w.estimatedExtraCost ?? 0), 0) ?? 0;
  }

  totalSaving(r: EvaluationResponse): number {
    return r.recommendations?.reduce((sum, rec) => sum + (rec.estimatedSavingEur ?? 0), 0) ?? 0;
  }

  formatCurrency(amount: number): string {
    if (!amount) return '—';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  }
}
