import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import gsap from 'gsap';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HlmButton],
  templateUrl: './app.html',
})
export class App implements AfterViewInit, OnDestroy {
  protected readonly title = signal('molel');

  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('btnSobre', { read: ElementRef }) private readonly btnSobre!: ElementRef<HTMLElement>;
  @ViewChild('btnContato', { read: ElementRef })

  private readonly btnContato!: ElementRef<HTMLElement>;

  private readonly disposers: Array<() => void> = [];

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.attachNavHover(this.btnSobre);
    this.attachNavHover(this.btnContato);
  }

  private attachNavHover(ref: ElementRef<HTMLElement>): void {
    const host = ref.nativeElement;
    const line = host.querySelector<HTMLElement>('[data-nav-line]');
    if (!line) return;

    gsap.set(line, {
      scaleY: 0,
      transformOrigin: '50% 100%',
    });

    const onEnter = () => {
      gsap.to(line, {
        scaleY: 1,
        duration: 0.38,
        ease: 'power3.out',
      });
    };

    const onLeave = () => {
      gsap.to(line, {
        scaleY: 0,
        duration: 0.28,
        ease: 'power2.in',
      });
    };

    host.addEventListener('mouseenter', onEnter);
    host.addEventListener('mouseleave', onLeave);

    this.disposers.push(() => {
      host.removeEventListener('mouseenter', onEnter);
      host.removeEventListener('mouseleave', onLeave);
      gsap.killTweensOf(line);
    });
  }

  ngOnDestroy(): void {
    for (const dispose of this.disposers) {
      dispose();
    }
    this.disposers.length = 0;
  }
}
