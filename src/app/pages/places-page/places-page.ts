import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import mapboxgl from 'mapbox-gl';
import { environment } from '@environments/environment';
import { Place } from '@maps/models/place';
import { PlacesService } from '@maps/services/places.service';

mapboxgl.accessToken = environment.mapboxKey;

const PIN_COLOR = '#346538';
const PIN_ACTIVE = '#9f2f2d';
const SF_CENTER: [number, number] = [-122.40985, 37.793085];

@Component({
  selector: 'app-places-page',
  imports: [FormsModule],
  templateUrl: './places-page.html',
})
export class PlacesPage implements AfterViewInit, OnDestroy {
  private readonly placesService = inject(PlacesService);

  divElement = viewChild<ElementRef>('map');
  map = signal<mapboxgl.Map | null>(null);

  query = signal('Starbucks');
  places = signal<Place[]>([]);
  selectedId = signal<string | null>(null);
  loading = signal(false);
  fromLocal = signal(false);

  private readonly mapboxMarkers = new Map<string, mapboxgl.Marker>();

  async ngAfterViewInit() {
    if (!this.divElement()?.nativeElement) return;

    await new Promise((resolve) => setTimeout(resolve, 80));

    const map = new mapboxgl.Map({
      container: this.divElement()!.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: SF_CENTER,
      zoom: 14,
    });

    this.map.set(map);
    await this.loadPlaces();
  }

  async loadPlaces() {
    const map = this.map();
    this.loading.set(true);

    const results = await this.placesService.search(this.query());
    this.places.set(results);
    this.fromLocal.set(results.length > 0 && results.every((p) => p.source === 'local'));
    this.selectedId.set(results[0]?.id ?? null);
    this.loading.set(false);

    if (!map) return;

    this.clearPins();
    for (const place of results) {
      this.placePin(map, place);
    }

    if (results[0]) {
      this.flyToPlace(results[0], false);
    }
  }

  onSearch(event: Event) {
    event.preventDefault();
    void this.loadPlaces();
  }

  selectPlace(place: Place) {
    this.selectedId.set(place.id);
    const map = this.map();
    if (map) {
      this.clearPins();
      for (const item of this.places()) {
        this.placePin(map, item);
      }
    }
    this.flyToPlace(place, true);
  }

  ngOnDestroy(): void {
    this.clearPins();
    this.map()?.remove();
  }

  private flyToPlace(place: Place, animate: boolean) {
    this.map()?.flyTo({
      center: [place.lng, place.lat],
      zoom: 16,
      essential: true,
      duration: animate ? 1200 : 0,
    });
  }

  private placePin(map: mapboxgl.Map, place: Place) {
    const marker = new mapboxgl.Marker({
      color: place.id === this.selectedId() ? PIN_ACTIVE : PIN_COLOR,
    })
      .setLngLat([place.lng, place.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 18, closeButton: false }).setText(
          `${place.name} · ${place.address}`,
        ),
      )
      .addTo(map);

    marker.getElement().style.cursor = 'pointer';
    marker.getElement().addEventListener('click', () => this.selectPlace(place));
    this.mapboxMarkers.set(place.id, marker);
  }

  private clearPins() {
    for (const marker of this.mapboxMarkers.values()) {
      marker.remove();
    }
    this.mapboxMarkers.clear();
  }
}
