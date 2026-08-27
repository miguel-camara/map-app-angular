import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MiniMap } from '@maps/components/mini-map/mini-map';
import { MarkersStore } from '@maps/services/markers.store';
import { RevealDirective } from '@shared/directives/reveal';

@Component({
  selector: 'app-houses-page',
  imports: [MiniMap, RouterLink, DecimalPipe, RevealDirective],
  templateUrl: './houses-page.html',
})
export class HousesPage {
  private readonly store = inject(MarkersStore);

  houses = computed(() =>
    this.store.markers().map((marker, index) => ({
      id: marker.id,
      name: `Punto ${index + 1}`,
      color: marker.color,
      lngLat: { lng: marker.lng, lat: marker.lat },
    })),
  );
}
