import { Injectable, signal } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { SavedMarker } from '../models/saved-marker';

const STORAGE_KEY = 'map-app-markers';

@Injectable({ providedIn: 'root' })
export class MarkersStore {
  private readonly markersState = signal<SavedMarker[]>([]);
  readonly markers = this.markersState.asReadonly();

  constructor() {
    this.hydrate();
  }

  add(input: { lng: number; lat: number; color: string }): SavedMarker {
    const marker: SavedMarker = {
      id: uuid(),
      lng: input.lng,
      lat: input.lat,
      color: input.color,
      createdAt: Date.now(),
    };

    this.markersState.update((list) => [marker, ...list]);
    this.persist();
    return marker;
  }

  remove(id: string): void {
    this.markersState.update((list) => list.filter((marker) => marker.id !== id));
    this.persist();
  }

  private hydrate(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as SavedMarker[];
      if (!Array.isArray(parsed)) return;

      const valid = parsed.filter(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          typeof item.lng === 'number' &&
          typeof item.lat === 'number' &&
          typeof item.color === 'string',
      );

      this.markersState.set(valid);
    } catch {
      this.markersState.set([]);
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.markersState()));
  }
}
