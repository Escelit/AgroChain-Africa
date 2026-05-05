import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Harvest {
  id: string;
  stellarBatchId: string;
  commodity: string;
  grade: string;
  weightKg: number;
  locationGeohash: string;
  harvestDate: string;
  status: string;
  estimatedValueUsdc: number;
  createdAt: string;
}

export interface CreateHarvestDto {
  commodity: string;
  grade: string;
  weightKg: number;
  locationGeohash: string;
  harvestDate: string;
  estimatedValueUsdc?: number;
}

@Injectable({ providedIn: 'root' })
export class HarvestsService {
  private base = `${environment.apiUrl}/harvests`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Harvest[]> {
    return this.http.get<Harvest[]>(this.base);
  }

  getOne(id: string): Observable<Harvest> {
    return this.http.get<Harvest>(`${this.base}/${id}`);
  }

  create(dto: CreateHarvestDto): Observable<Harvest> {
    return this.http.post<Harvest>(this.base, dto);
  }

  tokenize(id: string): Observable<Harvest> {
    return this.http.post<Harvest>(`${this.base}/${id}/tokenize`, {});
  }
}
