import { Injectable, signal } from '@angular/core';
import { BackwardQueryResponse, EvaluationResponse } from '../models/apartment.models';

@Injectable({ providedIn: 'root' })
export class ResultsService {
  evaluationResult = signal<EvaluationResponse | null>(null);
  backwardResult = signal<BackwardQueryResponse | null>(null);
  resultType = signal<'evaluation' | 'backward' | null>(null);

  setEvaluationResult(result: EvaluationResponse) {
    this.evaluationResult.set(result);
    this.backwardResult.set(null);
    this.resultType.set('evaluation');
  }

  setBackwardResult(result: BackwardQueryResponse) {
    this.backwardResult.set(result);
    this.evaluationResult.set(null);
    this.resultType.set('backward');
  }

  clear() {
    this.evaluationResult.set(null);
    this.backwardResult.set(null);
    this.resultType.set(null);
  }
}
