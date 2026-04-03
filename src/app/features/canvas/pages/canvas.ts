import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  signal,
  ViewChild,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Application, TilingSprite } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { createGridTexture } from '../services/gridTextura';
import { MolecularGraphService } from '../services/molecular-graph.service';
import { MoleculeSceneLayer } from '../visual';
import { ElementoQuimico } from '../domain/atom-node';
import { CATEGORIAS_ELEMENTO } from '../domain/element-palette';

const WORLD = { width: 5000, height: 5000 } as const;
const ZOOM = { min: 0.2, max: 3 } as const;
const BG = 0xf8fafc;

@Component({
  selector: 'app-canvas',
  imports: [RouterLink],
  templateUrl: './canvas.html',
  styleUrl: './canvas.css',
  providers: [MolecularGraphService],
})
export class Canvas implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  /** Exposto ao template para painel de notação. */
  protected readonly graphSvc = inject(MolecularGraphService);

  protected readonly filtroTexto = signal('');
  protected readonly categoriaFiltro = signal<string>('todas');
  /** Paleta de elementos expandida (true) ou só a aba de reabrir (false). */
  protected readonly paletaAberta = signal(true);

  protected alternarPaleta(): void {
    this.paletaAberta.update((v) => !v);
  }

  protected readonly opcoesCategoria = [
    { id: 'todas', label: 'Todas as categorias' },
    ...CATEGORIAS_ELEMENTO.map((c) => ({ id: c.id, label: c.label })),
  ] as const;

  /** Categorias com elementos filtrados por busca e por categoria selecionada. */
  protected readonly paletaFiltrada = computed(() => {
    const q = this.filtroTexto().trim().toLowerCase();
    const catId = this.categoriaFiltro();

    const passaTexto = (el: ElementoQuimico): boolean => {
      if (!q) return true;
      const nome =
        Object.entries(ElementoQuimico).find(([, v]) => v === el)?.[0] ?? '';
      return el.toLowerCase().includes(q) || nome.toLowerCase().includes(q);
    };

    return CATEGORIAS_ELEMENTO.filter((c) => catId === 'todas' || c.id === catId)
      .map((c) => ({
        id: c.id,
        label: c.label,
        elementos: c.elementos
          .filter(passaTexto)
          .map((simbolo) => ({
            simbolo,
            nome: Object.entries(ElementoQuimico).find(([, v]) => v === simbolo)?.[0] ?? '',
          })),
      }))
      .filter((c) => c.elementos.length > 0);
  });

  @ViewChild('host', { static: true }) host!: ElementRef<HTMLElement>;

  private app?: Application;
  private viewport?: Viewport;
  private moleculeLayer?: MoleculeSceneLayer;
  private readonly disposers: Array<() => void> = [];

  constructor() {
    effect(() => {
      const g = this.graphSvc.graph();
      this.moleculeLayer?.sync(g);
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    await this.bootstrapPixi();
    this.setupViewport();
    this.setupGrid();
    this.bindViewportResize();
    this.setupMoleculeLayer();
  }

  private async bootstrapPixi(): Promise<void> {
    const host = this.host.nativeElement;

    this.app = new Application();
    await this.app.init({
      resizeTo: host,
      background: BG,
      antialias: true,
      autoDensity: true,
      resolution: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    });

    const canvasEl = this.app.canvas as HTMLCanvasElement;
    host.appendChild(canvasEl);
    this.attachDragCursor(canvasEl);
  }

  private attachDragCursor(canvas: HTMLCanvasElement): void {
    const onDown = (e: PointerEvent) => {
      if (e.button === 0) {
        document.body.style.cursor = 'grabbing';
      }
    };
    const onUp = () => {
      document.body.style.cursor = '';
    };
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    canvas.style.cursor = 'grab';
    this.disposers.push(() => {
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.body.style.cursor = '';
      canvas.style.cursor = '';
    });
  }

  private setupViewport(): void {
    const app = this.app;
    const host = this.host.nativeElement;
    if (!app) return;

    const w = host.clientWidth;
    const h = host.clientHeight;

    this.viewport = new Viewport({
      screenWidth: w,
      screenHeight: h,
      worldWidth: WORLD.width,
      worldHeight: WORLD.height,
      events: app.renderer.events,
    });

    this.viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate()
      .clamp({
        direction: 'all',
        underflow: 'center',
      })
      .clampZoom({
        minScale: ZOOM.min,
        maxScale: ZOOM.max,
      });

    this.viewport.moveCenter(WORLD.width / 2, WORLD.height / 2);
    app.stage.addChild(this.viewport);
  }

  private setupGrid(): void {
    const app = this.app;
    const viewport = this.viewport;
    if (!app || !viewport) return;

    const texture = createGridTexture(app);

    const grid = new TilingSprite({
      texture,
      width: WORLD.width,
      height: WORLD.height,
    });

    grid.position.set(0, 0);

    viewport.addChildAt(grid, 0);
  }

  private setupMoleculeLayer(): void {
    const viewport = this.viewport;
    if (!viewport) return;

    this.moleculeLayer = new MoleculeSceneLayer(viewport);
    this.moleculeLayer.sync(this.graphSvc.graph());
  }

  private bindViewportResize(): void {
    const viewport = this.viewport;
    const host = this.host.nativeElement;
    if (!viewport) return;

    const sync = () => {
      viewport.resize(host.clientWidth, host.clientHeight, WORLD.width, WORLD.height);
    };

    sync();

    const ro = new ResizeObserver(() => sync());
    ro.observe(host);
    this.disposers.push(() => ro.disconnect());
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    for (const dispose of this.disposers) {
      dispose();
    }
    this.disposers.length = 0;

    this.moleculeLayer?.destroy();
    this.moleculeLayer = undefined;

    if (!this.app) {
      return;
    }

    this.app.destroy(true, { children: true });
    this.app = undefined;
    this.viewport = undefined;
  }
}
