import {
  afterNextRender,
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
} from '@angular/core';

@Directive({
  selector: '[appReveal]',
})
export class RevealDirective implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private observer: IntersectionObserver | null = null;

  index = input(0, { alias: 'appReveal' });

  constructor() {
    afterNextRender(() => {
      const node = this.el.nativeElement;
      node.style.setProperty('--index', String(this.index()));
      node.classList.add('reveal');

      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            node.classList.add('is-visible');
            this.observer?.disconnect();
          }
        },
        { threshold: 0.12 },
      );

      this.observer.observe(node);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
