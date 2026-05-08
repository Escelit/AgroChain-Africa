import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Loan {
  id: string;
  lenderPublicKey: string;
  principalUsdc: number;
  repaidUsdc: number;
  interestBps: number;
  durationDays: number;
  dueDate: string;
  status: string;
  createdAt: string;
}

export interface CreateLoanDto {
  harvestId: string;
  lenderPublicKey: string;
  principalUsdc: number;
  interestBps: number;
  durationDays: number;
}

@Injectable({ providedIn: 'root' })
export class LoansService {
  private base = `${environment.apiUrl}/loans`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Loan[]> {
    return this.http.get<Loan[]>(this.base);
  }

  getOne(id: string): Observable<Loan> {
    return this.http.get<Loan>(`${this.base}/${id}`);
  }

  create(dto: CreateLoanDto): Observable<Loan> {
    return this.http.post<Loan>(this.base, dto);
  }

  repay(id: string, amountUsdc: number): Observable<Loan> {
    return this.http.post<Loan>(`${this.base}/${id}/repay`, { amountUsdc });
  }
}
