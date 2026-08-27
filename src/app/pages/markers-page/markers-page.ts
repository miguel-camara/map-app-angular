import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import mapboxgl from 'mapbox-gl';
import { environment } from '@environments/environment';
import { MarkersStore } from '@maps/services/markers.store';
import { SavedMarker } from '@maps/models/saved-marker';

mapboxgl.accessToken = environment.mapboxKey;

@Component({
  selector: 'app-markers-page',
  imports: [DecimalPipe],
  templateUrl: './markers-page.html',
})
export class MarkersPage implements AfterViewInit, OnDestroy {
  private readonly store = inject(MarkersStore);

  divElement = viewChild<ElementRef>('map');
  map = signal<mapboxgl.Map | null>(null);

  markers = this.store.markers;
  private readonly mapboxMarkers = new Map<string, mapboxgl.Marker>();

  async ngAfterViewInit() {
    if (!this.divElement()?.nativeElement) return;

    await new Promise((resolve) => setTimeout(resolve, 80));

    const element = this.divElement()!.nativeElement;
    const saved = this.markers();
    const center: [number, number] = saved.length
      ? [saved[0].lng, saved[0].lat]
      : [-122.40985, 37.793085];

    const map = new mapboxgl.Map({
      container: element,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom: 14,
    });

    this.mapListeners(map);
    this.hydratePins(map);
  }

  mapListeners(map: mapboxgl.Map) {
    map.on('click', (event) => this.mapClick(event));
    this.map.set(map);
  }

  mapClick(event: mapboxgl.MapMouseEvent) {
    const map = this.map();
    if (!map) return;

    const coords = event.lngLat;
    const color = '#xxxxxx'.replace(/x/g, () =>
      ((Math.random() * 16) | 0).toString(16),
    );

    const saved = this.store.add({
      lng: coords.lng,
      lat: coords.lat,
      color,
    });

    this.placePin(map, saved);
  }

  flyToMarker(marker: SavedMarker) {
    this.map()?.flyTo({
      center: [marker.lng, marker.lat],
    });
  }

  deleteMarker(marker: SavedMarker) {
    this.mapboxMarkers.get(marker.id)?.remove();
    this.mapboxMarkers.delete(marker.id);
    this.store.remove(marker.id);
  }

  ngOnDestroy(): void {
    this.map()?.remove();
    this.mapboxMarkers.clear();
  }

  private hydratePins(map: mapboxgl.Map) {
    for (const saved of this.markers()) {
      this.placePin(map, saved);
    }
  }

  private placePin(map: mapboxgl.Map, saved: SavedMarker) {
    const mapboxMarker = new mapboxgl.Marker({ color: saved.color })
      .setLngLat([saved.lng, saved.lat])
      .addTo(map);

    this.mapboxMarkers.set(saved.id, mapboxMarker);
  }
}
