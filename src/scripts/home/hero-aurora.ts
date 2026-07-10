import { ASCII_AURORA_FRAME_INTERVAL, renderAsciiAurora } from '../../lib/ascii-aurora';

export function initHeroAurora(element: HTMLElement, reducedMotion: boolean): () => void {
  if (reducedMotion) return () => {};

  const abortController = new AbortController();
  const { signal } = abortController;
  let animationFrame = 0;
  let lastFrame = 0;
  let isVisible = true;
  let destroyed = false;

  const stop = () => {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  const render = (now: number) => {
    if (destroyed || document.hidden || !isVisible) {
      stop();
      return;
    }

    if (now - lastFrame >= ASCII_AURORA_FRAME_INTERVAL) {
      lastFrame = now;
      element.textContent = renderAsciiAurora(now / 1000);
    }
    animationFrame = requestAnimationFrame(render);
  };

  const start = () => {
    if (animationFrame || destroyed || document.hidden || !isVisible) return;
    animationFrame = requestAnimationFrame(render);
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  }, { signal });

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry?.isIntersecting ?? false;
    if (isVisible) start();
    else stop();
  }, { rootMargin: '160px 0px' });
  intersectionObserver.observe(element);
  start();

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    stop();
    abortController.abort();
    intersectionObserver.disconnect();
  };
  document.addEventListener('astro:before-swap', destroy, { once: true, signal });
  return destroy;
}
