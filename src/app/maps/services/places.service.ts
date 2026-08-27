import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, of, timeout } from 'rxjs';
import { LOCAL_STARBUCKS_SF } from '../data/starbucks-sf';
import { Place } from '../models/place';

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const SF_CENTER = { lat: 37.793085, lng: -122.40985 };

@Injectable({ providedIn: 'root' })
export class PlacesService {
  private readonly http = inject(HttpClient);

  search(query: string, center = SF_CENTER): Promise<Place[]> {
    const q = query.trim() || 'Starbucks';

    return new Promise((resolve) => {
      this.http
        .post<OverpassResponse>(OVERPASS_URL, this.buildQuery(q, center), {
          headers: new HttpHeaders({ 'Content-Type': 'text/plain' }),
        })
        .pipe(
          timeout(12_000),
          map((response) => this.toPlaces(response)),
          catchError(() => of([] as Place[])),
        )
        .subscribe((places) => {
          if (places.length > 0) {
            resolve(places);
            return;
          }

          resolve(this.localFallback(q));
        });
    });
  }

  private localFallback(query: string): Place[] {
    const needle = query.toLowerCase();
    const isStarbucks =
      needle.includes('starbucks') || needle.includes('café') || needle.includes('cafe');

    if (!isStarbucks) return [];
    return LOCAL_STARBUCKS_SF;
  }

  private buildQuery(query: string, center: { lat: number; lng: number }): string {
    const safe = query.replace(/[\\"()]/g, '').slice(0, 40);
    return `
      [out:json][timeout:10];
      (
        node["brand"~"${safe}",i](around:4500,${center.lat},${center.lng});
        node["name"~"${safe}",i]["amenity"](around:4500,${center.lat},${center.lng});
        node["name"~"${safe}",i]["shop"](around:4500,${center.lat},${center.lng});
      );
      out body 25;
    `;
  }

  private toPlaces(response: OverpassResponse): Place[] {
    const elements = response.elements ?? [];
    const seen = new Set<string>();

    return elements
      .filter((el) => typeof el.lat === 'number' && typeof el.lon === 'number')
      .map((el) => {
        const tags = el.tags ?? {};
        const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
        const address = street || tags['addr:full'] || tags['addr:city'] || 'San Francisco';

        return {
          id: `osm-${el.id}`,
          name: tags['name'] || tags['brand'] || 'Establecimiento',
          address,
          lng: el.lon as number,
          lat: el.lat as number,
          source: 'overpass' as const,
        };
      })
      .filter((place) => {
        if (seen.has(place.id)) return false;
        seen.add(place.id);
        return true;
      });
  }
}
