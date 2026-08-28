import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { routes } from '../../../app.routes';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
})
export class Navbar {
  private readonly router = inject(Router);

  menuOpen = signal(false);

  routes = routes
    .map((route) => ({
      path: route.path ?? '',
      title: `${route.title ?? 'Atlas'}`,
    }))
    .filter((route) => route.path !== '**');

  pageTitle = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => this.titleFromUrl(event.urlAfterRedirects)),
    ),
    { initialValue: this.titleFromUrl(this.router.url) },
  );

  private titleFromUrl(url: string): string {
    const path = url.split('?')[0].replace(/^\/#?\/?/, '').replace(/^\//, '');
    return `${routes.find((route) => route.path === path)?.title ?? 'Atlas'}`;
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
