const CONFIG = {
  cloneBuffer: 96,
  minimumTravelCards: 1.25,
  travelDamping: 1,
  edgeRevealMultiplier: 3.4,
  scrollEase: 0.075,
  scrubEase: 0.22,
  progressStart: 0.84,
  progressEnd: 0.18,
} as const;

type RailMetrics = {
  row: HTMLElement;
  originals: HTMLButtonElement[];
  direction: 1 | -1;
  travel: number;
  base: number;
};

type AuditEntry = {
  progress: number;
  row: 'top' | 'bottom';
  index: number;
  name: string | undefined;
  clone: boolean;
  visible: string;
};

type AuditWindow = Window & {
  __auditIntegrationRails?: (points?: number[]) => AuditEntry[];
};

const clampProgress = (value: number) => Math.min(Math.max(value, 0), 1);

export function initIntegrationRail(root: HTMLElement, reducedMotion: boolean): () => void {
  const railboard = root.querySelector<HTMLElement>('.integrations-railboard');
  const scrubber = root.querySelector<HTMLElement>('.integration-scrubber');
  const rows = Array.from(root.querySelectorAll<HTMLElement>('.integration-track'));

  if (!railboard || !scrubber || rows.length === 0) return () => {};

  const metrics = rows.map<RailMetrics>((row) => ({
    row,
    originals: Array.from(row.children).filter(
      (child): child is HTMLButtonElement =>
        child instanceof HTMLButtonElement && child.matches('.integration-card'),
    ),
    direction: row.dataset.dir === 'right' ? 1 : -1,
    travel: 0,
    base: 0,
  }));
  const ticks = Array.from(scrubber.querySelectorAll<HTMLElement>('span'));
  const abortController = new AbortController();
  const { signal } = abortController;
  let animationFrame = 0;
  let currentProgress = 0;
  let draggedProgress: number | null = null;
  let manualProgress: number | null = null;
  let isVisible = true;
  let destroyed = false;

  const boardWidth = () => railboard.getBoundingClientRect().width;

  const measure = (metric: RailMetrics) => {
    const first = metric.originals[0]?.getBoundingClientRect();
    const last = metric.originals.at(-1)?.getBoundingClientRect();
    const cardWidth = first?.width ?? 178;
    const originalSpan = first && last ? last.right - first.left : cardWidth;
    const edgeReveal = Math.min(boardWidth() * 0.11, 96) * CONFIG.edgeRevealMultiplier;
    const rawTravel = Math.max(
      originalSpan - boardWidth() + edgeReveal,
      cardWidth * CONFIG.minimumTravelCards,
    );

    metric.travel = rawTravel * CONFIG.travelDamping;
    metric.base = metric.direction === 1 ? -metric.travel : 0;
  };

  const removeClones = (metric: RailMetrics) => {
    metric.row.querySelectorAll('[data-integration-clone]').forEach((clone) => clone.remove());
  };

  const createClone = (card: HTMLButtonElement) => {
    const clone = card.cloneNode(true) as HTMLButtonElement;
    clone.dataset.integrationClone = '';
    clone.setAttribute('aria-hidden', 'true');
    clone.tabIndex = -1;
    return clone;
  };

  const fillCloneBuffer = (metric: RailMetrics) => {
    const requiredWidth = boardWidth() + metric.travel + CONFIG.cloneBuffer;
    let passes = 0;

    while (metric.row.scrollWidth < requiredWidth && passes < 12) {
      metric.originals.forEach((card) => metric.row.append(createClone(card)));
      passes += 1;
    }
  };

  const layout = () => {
    metrics.forEach(removeClones);
    metrics.forEach((metric) => {
      measure(metric);
      fillCloneBuffer(metric);
    });
  };

  const positionAt = (metric: RailMetrics, progress: number) =>
    metric.base + metric.direction * progress * metric.travel;

  const applyTransforms = (progress: number) => {
    metrics.forEach((metric) => {
      metric.row.style.transform = `translate3d(${positionAt(metric, progress)}px, 0, 0)`;
    });
  };

  const updateTicks = (progress: number) => {
    const activePosition = progress * (ticks.length - 1);
    ticks.forEach((tick, index) => {
      const distance = Math.abs(index - activePosition);
      tick.classList.toggle('on', distance < 1.2);
      tick.classList.toggle('near', distance >= 1.2 && distance < 3.4);
    });
  };

  const progressForSection = () => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const startCenter = viewportHeight * CONFIG.progressStart;
    const endCenter = viewportHeight * CONFIG.progressEnd;
    const rect = railboard.getBoundingClientRect();
    const boardCenter = rect.top + rect.height / 2;
    return clampProgress((startCenter - boardCenter) / (startCenter - endCenter));
  };

  const progressFromPointer = (event: PointerEvent) => {
    const rect = scrubber.getBoundingClientRect();
    return clampProgress((event.clientX - rect.left) / rect.width);
  };

  const setActiveIntegration = (name: string | undefined) => {
    if (!name) return;
    root.querySelectorAll<HTMLButtonElement>('.integration-card').forEach((card) => {
      const isActive = card.dataset.name === name;
      card.classList.toggle('is-active', isActive);
      card.setAttribute('aria-pressed', String(isActive));
    });
  };

  const stopAnimation = () => {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  const animate = () => {
    if (destroyed || !isVisible || document.hidden) {
      stopAnimation();
      return;
    }

    const target = draggedProgress ?? manualProgress ?? progressForSection();
    const ease = draggedProgress == null && manualProgress == null
      ? CONFIG.scrollEase
      : CONFIG.scrubEase;
    currentProgress += (target - currentProgress) * ease;
    applyTransforms(currentProgress);
    updateTicks(currentProgress);
    animationFrame = requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    if (reducedMotion || animationFrame || destroyed || !isVisible || document.hidden) return;
    animationFrame = requestAnimationFrame(animate);
  };

  const updateDraggedProgress = (event: PointerEvent) => {
    manualProgress = progressFromPointer(event);
    draggedProgress = manualProgress;
  };

  const stopDragging = (event: PointerEvent) => {
    if (!scrubber.classList.contains('is-dragging')) return;
    scrubber.classList.remove('is-dragging');
    draggedProgress = null;
    if (scrubber.hasPointerCapture(event.pointerId)) scrubber.releasePointerCapture(event.pointerId);
  };

  const audit = (points = [0, 0.5, 1]): AuditEntry[] => {
    const entries: AuditEntry[] = [];
    const savedProgress = currentProgress;

    points.forEach((progress) => {
      applyTransforms(progress);
      const boardRect = railboard.getBoundingClientRect();
      metrics.forEach((metric) => {
        const row = metric.row.classList.contains('integration-track-top') ? 'top' : 'bottom';
        Array.from(metric.row.children).forEach((card, index) => {
          if (!(card instanceof HTMLElement)) return;
          const rect = card.getBoundingClientRect();
          const visibleWidth = Math.min(rect.right, boardRect.right) - Math.max(rect.left, boardRect.left);
          if (visibleWidth <= 1) return;
          entries.push({
            progress,
            row,
            index,
            name: card.dataset.name,
            clone: card.hasAttribute('data-integration-clone'),
            visible: `${Math.round((visibleWidth / rect.width) * 100)}%`,
          });
        });
      });
    });

    applyTransforms(savedProgress);
    return entries;
  };

  layout();
  currentProgress = reducedMotion ? 0.5 : progressForSection();
  applyTransforms(currentProgress);
  updateTicks(currentProgress);

  if (!reducedMotion) {
    scrubber.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      scrubber.setPointerCapture(event.pointerId);
      scrubber.classList.add('is-dragging');
      updateDraggedProgress(event);
      startAnimation();
    }, { signal });

    scrubber.addEventListener('pointermove', (event) => {
      if (scrubber.classList.contains('is-dragging')) updateDraggedProgress(event);
    }, { signal });
    scrubber.addEventListener('pointerup', stopDragging, { signal });
    scrubber.addEventListener('pointercancel', stopDragging, { signal });

    window.addEventListener('scroll', () => {
      if (!scrubber.classList.contains('is-dragging')) manualProgress = null;
    }, { passive: true, signal });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAnimation();
      else startAnimation();
    }, { signal });
  }

  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const card = target?.closest<HTMLButtonElement>('.integration-card');
    if (!card) return;
    setActiveIntegration(card.dataset.name);
    requestAnimationFrame(() => {
      layout();
      applyTransforms(manualProgress ?? currentProgress);
    });
  }, { signal });

  const resizeObserver = new ResizeObserver(() => {
    layout();
    applyTransforms(manualProgress ?? currentProgress);
  });
  resizeObserver.observe(railboard);

  const intersectionObserver = reducedMotion
    ? null
    : new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? false;
      if (isVisible) startAnimation();
      else stopAnimation();
    }, { rootMargin: '160px 0px' });
  intersectionObserver?.observe(root);
  startAnimation();

  if (import.meta.env.DEV) (window as AuditWindow).__auditIntegrationRails = audit;

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    stopAnimation();
    abortController.abort();
    resizeObserver.disconnect();
    intersectionObserver?.disconnect();
    metrics.forEach(removeClones);
    if (import.meta.env.DEV) delete (window as AuditWindow).__auditIntegrationRails;
  };

  document.addEventListener('astro:before-swap', destroy, { once: true, signal });
  return destroy;
}
