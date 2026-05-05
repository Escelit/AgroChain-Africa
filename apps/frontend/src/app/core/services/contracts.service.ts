import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EscrowContract {
  id: string;
  stellarContractId: string;
  buyerPublicKey: string;
  buyerName: string;
  amountUsdc: number;
  status: string;
  expectedWeightKg: number;
  expiryDate: string;
  deliveryConfirmedAt: string;
  createdAt: string;
}

export interface CreateContractDto {
  harvestId: string;
  buyerPublicKey: string;
  buyerName?: string;
  amountUsdc: number;
  expectedWeightKg: number;
  expiryDate: string;
}

@Injectable({ providedIn: 'root' })
export class ContractsService {
  private base = `${environment.apiUrl}/contracts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<EscrowContract[]> {
    return this.http.get<EscrowContract[]>(this.base);
  }

  getOne(id: string): Observable<EscrowContract> {
    return this.http.get<EscrowContract>(`${this.base}/${id}`);
  }

  create(dto: CreateContractDto): Observable<EscrowContract> {
    return this.http.post<EscrowContract>(this.base, dto);
  }

  dispute(id: string, reason: string): Observable<EscrowContract> {
    return this.http.post<EscrowContract>(`${this.base}/${id}/dispute`, { reason });
  }
}
