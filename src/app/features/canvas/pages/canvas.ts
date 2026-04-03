import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  OnDestroy,
  PLATFORM_ID,
  signal,
  ViewChild,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Application, FederatedPointerEvent, TilingSprite } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { createGridTexture } from '../services/gridTextura';
import { ElementPropertiesService } from '../services/element-properties.service';
import { MolecularGraphService } from '../services/molecular-graph.service';
import { MoleculeSceneLayer, NODE_HIT_RADIUS, type MoleculeSyncContext } from '../visual';
import { ElementoQuimico } from '../domain/atom-node';
import { CATEGORIAS_ELEMENTO } from '../domain/element-palette';
import {
  type BondOrder,
  atomIdMaisProximo,
  nextBondOrder,
  textoResumoLigacoesPt,
  type ResumoLigacoes,
} from '../domain';

const WORLD = { width: 5000, height: 5000 } as const;
const ZOOM = { min: 0.2, max: 3 } as const;
const BG = 0xf8fafc;
const DND_MIME_ELEMENTO = 'application/x-molel-elemento';

export type ModoFerramentaCanvas = 'colocar' | 'ligar';

@Component({
  selector: 'app-canvas',
  imports: [RouterLink],
  templateUrl: './canvas.html',
  styleUrl: './canvas.css',
  providers: [MolecularGraphService],
})
export class Canvas implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly graphSvc = inject(MolecularGraphService);
  protected readonly elementPropsSvc = inject(ElementPropertiesService);

  protected readonly filtroTexto = signal('');
  protected readonly categoriaFiltro = signal<string>('todas');
  protected readonly paletaAberta = signal(true);

  protected readonly modoFerramenta = signal<ModoFerramentaCanvas>('colocar');
  /** Ordem da próxima ligação criada no modo Ligar. */
  protected readonly ordemLigacao = signal<BondOrder>('single');
  protected readonly elementoSelecionado = signal<ElementoQuimico | null>(null);
  protected readonly atomoOrigemLigacao = signal<string | null>(null);
  protected readonly selectedAtomId = signal<string | null>(null);
  protected readonly mensagemErro = signal<string | null>(null);

  protected readonly draggingAtomId = signal<string | null>(null);

  protected alternarPaleta(): void {
    this.paletaAberta.update((v) => !v);
  }

  protected setModo(m: ModoFerramentaCanvas): void {
    this.modoFerramenta.set(m);
    this.mensagemErro.set(null);
    if (m === 'colocar') {
      this.atomoOrigemLigacao.set(null);
    }
  }

  protected setOrdemLigacao(o: BondOrder): void {
    this.ordemLigacao.set(o);
  }

  protected readonly opcoesOrdemLigacao = [
    { id: 'single' as const, label: '1' },
    { id: 'double' as const, label: '2' },
    { id: 'triple' as const, label: '3' },
    { id: 'aromatic' as const, label: 'Ar' },
  ] as const;

  protected readonly tituloOrdemLigacao: Record<BondOrder, string> = {
    single: 'Simples (atalho 1)',
    double: 'Dupla (atalho 2)',
    triple: 'Tripla (atalho 3)',
    aromatic: 'Aromática (atalho 4 ou A)',
  };

  /** Evita alternar seleção no clique fantasma após arrastar da paleta (HTML5 DnD). */
  private pulandoClickPaleta = false;

  protected selecionarElemento(sim: ElementoQuimico): void {
    if (this.pulandoClickPaleta) {
      this.pulandoClickPaleta = false;
      return;
    }
    this.elementoSelecionado.update((cur) => (cur === sim ? null : sim));
  }

  protected onElementoDragStart(ev: DragEvent, sim: ElementoQuimico): void {
    ev.dataTransfer?.setData('text/plain', sim);
    ev.dataTransfer?.setData(DND_MIME_ELEMENTO, sim);
    if (ev.dataTransfer) {
      ev.dataTransfer.effectAllowed = 'copy';
    }
    this.elementoSelecionado.set(sim);
    this.pulandoClickPaleta = true;
  }

  protected onElementoDragEnd(): void {
    setTimeout(() => {
      this.pulandoClickPaleta = false;
    }, 0);
  }

  protected onHostDragEnter(ev: DragEvent): void {
    ev.preventDefault();
  }

  protected onHostDragOver(ev: DragEvent): void {
    ev.preventDefault();
    if (ev.dataTransfer) {
      ev.dataTransfer.dropEffect = 'copy';
    }
  }

  protected onHostDrop(ev: DragEvent): void {
    ev.preventDefault();
    const raw =
      ev.dataTransfer?.getData(DND_MIME_ELEMENTO) ||
      ev.dataTransfer?.getData('text/plain') ||
      '';
    const sym = this.parseSimboloElemento(raw);
    if (!sym) {
      return;
    }
    this.modoFerramenta.set('colocar');
    this.colocarAtomoSePossivel(sym, ev.clientX, ev.clientY);
  }

  protected onHostCanvasClick(ev: MouseEvent): void {
    const canvas = this.host.nativeElement.querySelector('canvas');
    if (!canvas || ev.target !== canvas || ev.button !== 0) {
      return;
    }
    if (this.modoFerramenta() !== 'colocar') {
      return;
    }
    const sym = this.elementoSelecionado();
    if (!sym) {
      return;
    }
    this.colocarAtomoSePossivel(sym, ev.clientX, ev.clientY);
  }

  private parseSimboloElemento(raw: string): ElementoQuimico | null {
    const t = raw.trim();
    if (!t) {
      return null;
    }
    const valores = Object.values(ElementoQuimico) as string[];
    if (!valores.includes(t)) {
      return null;
    }
    return t as ElementoQuimico;
  }

  private colocarAtomoSePossivel(sym: ElementoQuimico, clientX: number, clientY: number): void {
    const vp = this.viewport;
    if (!vp) {
      return;
    }
    const host = this.host.nativeElement;
    const rect = host.getBoundingClientRect();
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return;
    }

    const world = vp.toWorld(clientX - rect.left, clientY - rect.top);
    const g = this.graphSvc.graph();
    if (atomIdMaisProximo(g, world.x, world.y, NODE_HIT_RADIUS)) {
      return;
    }

    this.graphSvc.addAtom(sym, world.x, world.y);
    this.mensagemErro.set(null);
  }

  protected readonly opcoesCategoria = [
    { id: 'todas', label: 'Todas as categorias' },
    ...CATEGORIAS_ELEMENTO.map((c) => ({ id: c.id, label: c.label })),
  ] as const;

  /**
   * Símbolo químico do átomo atualmente selecionado no grafo (destaque visual no canvas).
   * O painel de propriedades segue esta seleção, não a da paleta.
   */
  protected readonly simboloPropriedadesGrafo = computed((): ElementoQuimico | null => {
    const id = this.selectedAtomId();
    if (!id) {
      return null;
    }
    return this.graphSvc.graph().atoms.get(id)?.symbol ?? null;
  });

  /** Propriedades PubChem do elemento do átomo selecionado no grafo. */
  protected readonly propriedadesElementoSelecionado = computed(() => {
    const s = this.simboloPropriedadesGrafo();
    if (!s) {
      return null;
    }
    return this.elementPropsSvc.get(s) ?? null;
  });

  protected corCpkPaleta(sim: ElementoQuimico): string {
    return this.elementPropsSvc.cpkCssColor(sim) ?? 'rgba(255,255,255,0.08)';
  }

  /** Rótulo em português do enum (mesmo texto da paleta). */
  protected nomePortuguesElemento(sim: ElementoQuimico): string {
    return Object.entries(ElementoQuimico).find(([, v]) => v === sim)?.[0] ?? sim;
  }

  protected tituloPaletaComPubChem(item: { simbolo: ElementoQuimico; nome: string }): string {
    return `${item.nome} (${item.simbolo})\n${this.elementPropsSvc.resumoTooltip(item.simbolo)}`;
  }

  protected fmtProp(n: number | null): string {
    if (n === null) {
      return '—';
    }
    return String(n);
  }

  protected fmtLigacoes(r: ResumoLigacoes): string {
    return textoResumoLigacoesPt(r);
  }

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
      this.graphSvc.graph();
      this.atomoOrigemLigacao();
      this.selectedAtomId();
      this.draggingAtomId();
      this.modoFerramenta();
      this.applyMoleculeSync();
    });
  }

  private applyMoleculeSync(): void {
    const layer = this.moleculeLayer;
    if (!layer) {
      return;
    }

    const g = this.graphSvc.graph();
    const ctx: MoleculeSyncContext = {
      bondOriginId: this.atomoOrigemLigacao(),
      selectedAtomId: this.selectedAtomId(),
      onAtomPointerDown: (id, e) => this.onAtomPointerDown(id, e),
      onBondPointerDown: (id, e) => this.onBondPointerDown(id, e),
    };

    if (this.draggingAtomId()) {
      layer.updateLayoutFromGraph(g, ctx);
    } else {
      layer.sync(g, ctx);
    }
  }

  protected onBondPointerDown(bondId: string, _e: FederatedPointerEvent): void {
    const bond = this.graphSvc.graph().bonds.get(bondId);
    if (!bond) {
      return;
    }
    this.graphSvc.setBondOrder(bondId, nextBondOrder(bond.order));
    this.mensagemErro.set(null);
  }

  protected onAtomPointerDown(atomId: string, e: FederatedPointerEvent): void {
    if (e.button !== 0) {
      return;
    }

    const modo = this.modoFerramenta();
    if (modo === 'ligar') {
      this.handleBondAtomClick(atomId);
      return;
    }

    this.selectedAtomId.set(atomId);
    this.atomoOrigemLigacao.set(null);
    this.mensagemErro.set(null);
    this.draggingAtomId.set(atomId);

    const host = this.host.nativeElement;
    const onMove = (ev: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const p = this.viewport!.toWorld(ev.clientX - r.left, ev.clientY - r.top);
      this.graphSvc.moveAtom(atomId, p.x, p.y);
    };
    const onUp = () => {
      this.draggingAtomId.set(null);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }

  private handleBondAtomClick(atomId: string): void {
    const origin = this.atomoOrigemLigacao();
    if (!origin) {
      this.atomoOrigemLigacao.set(atomId);
      this.mensagemErro.set(null);
      return;
    }
    if (origin === atomId) {
      this.atomoOrigemLigacao.set(null);
      return;
    }
    try {
      this.graphSvc.addBond(origin, atomId, this.ordemLigacao());
      this.atomoOrigemLigacao.set(null);
      this.mensagemErro.set(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Não foi possível criar a ligação.';
      this.mensagemErro.set(msg);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(ev: KeyboardEvent): void {
    const t = ev.target as HTMLElement | null;
    if (
      t &&
      (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)
    ) {
      return;
    }

    if (ev.key === 'Escape') {
      this.atomoOrigemLigacao.set(null);
      this.selectedAtomId.set(null);
      this.mensagemErro.set(null);
      return;
    }

    if (this.modoFerramenta() === 'ligar') {
      const k = ev.key;
      if (k === '1') {
        this.ordemLigacao.set('single');
        return;
      }
      if (k === '2') {
        this.ordemLigacao.set('double');
        return;
      }
      if (k === '3') {
        this.ordemLigacao.set('triple');
        return;
      }
      if (k === '4' || k === 'a' || k === 'A') {
        this.ordemLigacao.set('aromatic');
        return;
      }
    }

    if (ev.key === 'Delete' || ev.key === 'Backspace') {
      const id = this.selectedAtomId();
      if (!id) {
        return;
      }
      ev.preventDefault();
      try {
        this.graphSvc.removeAtom(id);
        this.selectedAtomId.set(null);
        this.atomoOrigemLigacao.set(null);
        this.mensagemErro.set(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Não foi possível remover o átomo.';
        this.mensagemErro.set(msg);
      }
    }
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
      if (e.button === 2) {
        document.body.style.cursor = 'grabbing';
      }
    };
    const onUp = () => {
      document.body.style.cursor = '';
    };
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    canvas.style.cursor = 'default';
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
      disableOnContextMenu: true,
    });

    this.viewport
      .drag({
        mouseButtons: 'right',
      })
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
    this.viewport.eventMode = 'static';
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
    grid.eventMode = 'static';

    viewport.addChildAt(grid, 0);
  }

  private setupMoleculeLayer(): void {
    const viewport = this.viewport;
    if (!viewport) return;

    this.moleculeLayer = new MoleculeSceneLayer(viewport);
    this.applyMoleculeSync();
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
