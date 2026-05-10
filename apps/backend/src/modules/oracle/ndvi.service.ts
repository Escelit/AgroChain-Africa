import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SentinelHubToken {
  access_token: string;
  expires_in: number;
  fetchedAt: number;
}

export interface NdviResult {
  geohash: string;
  commodity: string;
  ndviMean: number;
  ndviMin: number;
  ndviMax: number;
  cloudCoverPct: number;
  estimatedYieldKgPerHa: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  updatedAt: Date;
}

@Injectable()
export class NdviService {
  private readonly logger = new Logger(NdviService.name);
  private tokenCache: SentinelHubToken | null = null;

  // Yield models per commodity (kg/ha) based on NDVI ranges
  private readonly yieldModels: Record<string, { base: number; ndviMultiplier: number }> = {
    MAIZE:   { base: 1500, ndviMultiplier: 3000 },
    COFFEE:  { base: 800,  ndviMultiplier: 1200 },
    COCOA:   { base: 600,  ndviMultiplier: 900  },
    SOYBEAN: { base: 1200, ndviMultiplier: 2000 },
    CASSAVA: { base: 8000, ndviMultiplier: 12000 },
    WHEAT:   { base: 1800, ndviMultiplier: 3500 },
    RICE:    { base: 2000, ndviMultiplier: 4000 },
  };

  constructor(private config: ConfigService) {}

  async getNdviForecast(geohash: string, commodity: string): Promise<NdviResult> {
    const clientId = this.config.get('SENTINEL_HUB_CLIENT_ID');
    const clientSecret = this.config.get('SENTINEL_HUB_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return this.mockForecast(geohash, commodity);
    }

    try {
      const bbox = this.geohashToBbox(geohash);
      const token = await this.getToken(clientId, clientSecret);
      const ndvi = await this.fetchNdvi(bbox, token);
      return this.buildResult(geohash, commodity, ndvi);
    } catch (err) {
      this.logger.warn(`Sentinel Hub failed, using mock: ${err.message}`);
      return this.mockForecast(geohash, commodity);
    }
  }

  private async getToken(clientId: string, clientSecret: string): Promise<string> {
    if (this.tokenCache && Date.now() - this.tokenCache.fetchedAt < (this.tokenCache.expires_in - 60) * 1000) {
      return this.tokenCache.access_token;
    }

    const res = await fetch('https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
    });

    const data = await res.json();
    this.tokenCache = { ...data, fetchedAt: Date.now() };
    return data.access_token;
  }

  private async fetchNdvi(bbox: number[], token: string): Promise<{ mean: number; min: number; max: number; cloudCover: number }> {
    const body = {
      input: {
        bounds: { bbox, properties: { crs: 'http://www.opengis.net/def/crs/EPSG/0/4326' } },
        data: [{ type: 'sentinel-2-l2a', dataFilter: { maxCloudCoverage: 80 } }],
      },
      aggregation: {
        timeRange: { from: new Date(Date.now() - 30 * 86400000).toISOString(), to: new Date().toISOString() },
        aggregationInterval: { of: 'P30D' },
        evalscript: `//VERSION=3\nfunction setup(){return{input:["B04","B08","dataMask"],output:{bands:4}}}\nfunction evaluatePixel(s){let ndvi=(s.B08-s.B04)/(s.B08+s.B04);return[ndvi,ndvi,ndvi,s.dataMask]}`,
      },
    };

    const res = await fetch('https://services.sentinel-hub.com/api/v1/statistics', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const stats = data?.data?.[0]?.outputs?.default?.bands?.B0?.stats;
    return { mean: stats?.mean ?? 0.5, min: stats?.min ?? 0.3, max: stats?.max ?? 0.8, cloudCover: 20 };
  }

  private buildResult(geohash: string, commodity: string, ndvi: { mean: number; min: number; max: number; cloudCover: number }): NdviResult {
    const model = this.yieldModels[commodity] || this.yieldModels['MAIZE'];
    const estimatedYieldKgPerHa = Math.round(model.base + model.ndviMultiplier * ndvi.mean);
    return {
      geohash, commodity,
      ndviMean: Math.round(ndvi.mean * 1000) / 1000,
      ndviMin: Math.round(ndvi.min * 1000) / 1000,
      ndviMax: Math.round(ndvi.max * 1000) / 1000,
      cloudCoverPct: ndvi.cloudCover,
      estimatedYieldKgPerHa,
      confidence: ndvi.cloudCover < 20 ? 'HIGH' : ndvi.cloudCover < 50 ? 'MEDIUM' : 'LOW',
      updatedAt: new Date(),
    };
  }

  private mockForecast(geohash: string, commodity: string): NdviResult {
    const ndviMean = 0.45 + Math.random() * 0.35;
    return this.buildResult(geohash, commodity, { mean: ndviMean, min: ndviMean - 0.1, max: ndviMean + 0.1, cloudCover: 25 });
  }

  private geohashToBbox(geohash: string): number[] {
    // Simplified geohash decode — returns [minLon, minLat, maxLon, maxLat]
    const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let minLat = -90, maxLat = 90, minLon = -180, maxLon = 180;
    let isLon = true;
    for (const char of geohash) {
      const bits = base32.indexOf(char);
      for (let i = 4; i >= 0; i--) {
        const bit = (bits >> i) & 1;
        if (isLon) { const mid = (minLon + maxLon) / 2; bit ? (minLon = mid) : (maxLon = mid); }
        else { const mid = (minLat + maxLat) / 2; bit ? (minLat = mid) : (maxLat = mid); }
        isLon = !isLon;
      }
    }
    return [minLon, minLat, maxLon, maxLat];
  }
}
