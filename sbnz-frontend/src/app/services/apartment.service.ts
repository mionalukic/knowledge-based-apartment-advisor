import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BackwardQueryRequest,
  BackwardQueryResponse,
  EvaluationRequest,
  EvaluationResponse,
} from '../models/apartment.models';

@Injectable({ providedIn: 'root' })
export class ApartmentService {
  private readonly baseUrl = '/api/apartments';

  constructor(private http: HttpClient) {}

  evaluate(request: EvaluationRequest): Observable<EvaluationResponse> {
    return this.http.post<EvaluationResponse>(`${this.baseUrl}/evaluate`, request);
  }

  backwardQuery(request: BackwardQueryRequest): Observable<BackwardQueryResponse> {
    return this.http.post<BackwardQueryResponse>(`${this.baseUrl}/backward-query`, request);
  }
}
