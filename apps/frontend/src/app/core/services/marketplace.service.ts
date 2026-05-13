import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MarketplaceLot {
  harvest: {
    id: string;
    commodity: string;
    grade: string;
    weightKg: number;
    locationGeohash: string;
    harvestDate: string;
    estimatedValueUsdc: number;
    farmer: { stellarPublicKey: string; countryCode: string };
  };
  ndviForecast: {
    estimatedYieldKgPerHa: number;
    confidence: string;
    ndviScore: string;
    updatedAt: string;
  };
}

@Injectable({ providedIn: 'root' })
export class MarketplaceService {
  private base = `${environment.apiUrl}/marketplace`;

  constructor(private http: HttpClient) {}

  browse(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }

  getLot(id: string): Observable<MarketplaceLot> {
    return this.http.get<MarketplaceLot>(`${this.base}/${id}`);
  }
}
