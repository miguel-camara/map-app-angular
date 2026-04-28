import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  signal,
  viewChild,
} from '@angular/core';
import mapboxgl from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
import { DecimalPipe, JsonPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

mapboxgl.accessToken = environment.mapboxKey;

const MAPBOXSTANDAR: string = 'mapbox://styles/mapbox/standard';
const MAPBOXSATELLITE: string = 'mapbox://styles/mapbox/standard-satellite';


@Component({
  selector: 'app-fullscreen-map-page',
  imports: [DecimalPipe, JsonPipe],
  templateUrl: './fullscreen-map-page.html',
})
export class FullscreenMapPage implements AfterViewInit {
  divElement = viewChild<ElementRef>('map');
  map = signal<mapboxgl.Map | null>(null);
  isToggled = signal(false);
  style = signal(MAPBOXSTANDAR);

  zoom = signal(10);
  coordinates = signal({
    lng: -90.20,
    lat: 18.80,
  });

  zoomEffect = effect(() => {
    if (!this.map()) return;

    this.map()?.setZoom(this.zoom());
  });

  styleEffect = effect(() => {
    if (!this.map()) return;

    this.map()?.setStyle(this.style());
  });

  async ngAfterViewInit() {
    if (!this.divElement()?.nativeElement) return;

    await new Promise((resolve) => setTimeout(resolve, 80));

    const element = this.divElement()!.nativeElement;
    const { lat, lng } = this.coordinates();

    const map = new mapboxgl.Map({
      container: element, // container ID
      style: this.style(), // style URL
      center: [lng, lat], // starting position [lng, lat]
      zoom: this.zoom(), // starting zoom

    });

    this.mapListeners(map);
  }

  mapListeners(map: mapboxgl.Map) {

    map.on('zoomend', (event) => {
      const newZoom = event.target.getZoom();
      this.zoom.set(newZoom);
    });

    map.on('moveend', () => {
      const center = map.getCenter();
      this.coordinates.set(center);
    });

    map.on('load', () => {
      console.log('Map loaded');
    });

    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.ScaleControl());

    this.map.set(map);
  }

  toggle(value: boolean) {
    const res = value ? MAPBOXSATELLITE : MAPBOXSTANDAR;
    this.style.set(res);
    this.isToggled.set(value);
  }
}
