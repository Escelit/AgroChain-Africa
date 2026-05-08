import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FarmerProfile {
  id: string;
  stellarPublicKey: string;
  fullName: string;
  phone: string;
  countryCode: string;
  onChainCreditScore: number;
  kycVerified: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class FarmerService {
  private base = `${environment.apiUrl}/farmers`;

  constructor(private http: HttpClient) {}

  getMe(): Observable<FarmerProfile> {
    return this.http.get<FarmerProfile>(`${this.base}/me`);
  }

  updateMe(data: Partial<FarmerProfile>): Observable<FarmerProfile> {
    return this.http.put<FarmerProfile>(`${this.base}/me`, data);
  }

  getCreditScore(publicKey: string): Observable<FarmerProfile> {
    return this.http.get<FarmerProfile>(`${this.base}/${publicKey}/credit`);
  }
}
