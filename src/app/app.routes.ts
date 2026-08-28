import { Routes } from '@angular/router';
import { FullscreenMapPage } from './pages/fullscreen-map-page/fullscreen-map-page';
import { MarkersPage } from './pages/markers-page/markers-page';
import { HousesPage } from './pages/houses-page/houses-page';
import { PlacesPage } from './pages/places-page/places-page';

export const routes: Routes = [
  {
    path: 'fullscreen',
    component: FullscreenMapPage,
    title: 'Mapa',
  },
  {
    path: 'markers',
    component: MarkersPage,
    title: 'Marcadores',
  },
  {
    path: 'houses',
    component: HousesPage,
    title: 'Propiedades',
  },
  {
    path: 'places',
    component: PlacesPage,
    title: 'Establecimientos',
  },
  {
    path: '**',
    redirectTo: 'fullscreen',
  },
];
