import { confetti } from '@tsparticles/confetti'

/**
 * Helpers de confete (tsParticles, API compatível com canvas-confetti).
 * origin.x/origin.y são frações 0–1 da viewport.
 */

function originFromEvent(event) {
  if (!event || typeof event.clientX !== 'number') {
    return { x: 0.5, y: 0.5 }
  }
  return {
    x: event.clientX / window.innerWidth,
    y: event.clientY / window.innerHeight,
  }
}

// Cor de destaque do tema atual (lida do CSS).
function accentColors() {
  const styles = getComputedStyle(document.documentElement)
  const a = styles.getPropertyValue('--accent').trim() || '#f5c518'
  const a2 = styles.getPropertyValue('--accent-2').trim() || '#ffe08a'
  return [a, a2, '#ffffff']
}

/** Pequeno estouro na posição do clique. */
export function burstAt(event) {
  confetti({
    particleCount: 36,
    spread: 70,
    startVelocity: 28,
    gravity: 0.9,
    scalar: 0.85,
    ticks: 120,
    origin: originFromEvent(event),
    colors: accentColors(),
  })
}

/** Celebração de acerto: dois jatos vindos das laterais inferiores. */
export function celebrate() {
  const colors = ['#22c55e', '#16a34a', ...accentColors()]
  const common = { particleCount: 90, spread: 80, ticks: 200, colors }
  confetti({ ...common, angle: 60, origin: { x: 0, y: 0.7 } })
  confetti({ ...common, angle: 120, origin: { x: 1, y: 0.7 } })
}
