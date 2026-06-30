<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { burstAt } from '../composables/useConfetti.js'

defineProps({
  // Número da fase que esgotou na sessão, ou null.
  exhaustedPhase: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['select', 'reset', 'measure'])

// Mede a altura da grade de fases e emite, para que o card de prêmio
// (em outro componente) possa casar exatamente essa altura.
const phasesEl = ref(null)
let resizeObserver = null

onMounted(() => {
  if (!phasesEl.value) return
  resizeObserver = new ResizeObserver(() => {
    if (phasesEl.value) emit('measure', phasesEl.value.offsetHeight)
  })
  resizeObserver.observe(phasesEl.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

const phases = [
  { id: '1', label: 'Fase 1', hint: 'Fácil' },
  { id: '2', label: 'Fase 2', hint: 'Médio' },
  { id: '3', label: 'Fase 3', hint: 'Difícil' },
  { id: '4', label: 'Fase 4', hint: 'Muito difícil' },
]

const MAX_TILT = 7 // graus — inclinação contida (calm interface)

// Tilt 3D seguindo o cursor dentro do card.
function onMove(event) {
  const el = event.currentTarget
  const r = el.getBoundingClientRect()
  const px = (event.clientX - r.left) / r.width - 0.5
  const py = (event.clientY - r.top) / r.height - 0.5
  el.style.setProperty('--rx', `${(-py * MAX_TILT).toFixed(2)}deg`)
  el.style.setProperty('--ry', `${(px * MAX_TILT).toFixed(2)}deg`)
  el.style.setProperty('--mx', `${((px + 0.5) * 100).toFixed(1)}%`)
  el.style.setProperty('--my', `${((py + 0.5) * 100).toFixed(1)}%`)
}

function onLeave(event) {
  const el = event.currentTarget
  el.style.setProperty('--rx', '0deg')
  el.style.setProperty('--ry', '0deg')
}

function onPick(phaseId, event) {
  burstAt(event)
  emit('select', phaseId)
}

function onReset() {
  emit('reset')
}
</script>

<template>
  <section class="phase-select">
    <div ref="phasesEl" class="phases">
      <button
        v-for="(phase, i) in phases"
        :key="phase.id"
        class="phase-card glass"
        type="button"
        v-motion
        :initial="{ opacity: 0, y: 40, scale: 0.9 }"
        :enter="{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { delay: 120 + i * 90, type: 'spring', stiffness: 260, damping: 18 },
        }"
        @mousemove="onMove"
        @mouseleave="onLeave"
        @click="onPick(phase.id, $event)"
      >
        <span class="phase-glow" aria-hidden="true" />
        <svg class="phase-badge" viewBox="0 0 64 64" aria-hidden="true">
          <polygon
            class="phase-badge__hex phase-badge__hex--outer"
            points="32,3 57,17.5 57,46.5 32,61 7,46.5 7,17.5"
          />
          <polygon
            class="phase-badge__hex phase-badge__hex--inner"
            points="32,11 50,21.5 50,42.5 32,53 14,42.5 14,21.5"
          />
          <text
            class="phase-badge__num"
            x="32"
            y="34"
            text-anchor="middle"
            dominant-baseline="central"
          >
            {{ phase.id }}
          </text>
        </svg>
        <span class="phase-label">{{ phase.label }}</span>
        <span class="phase-hint">{{ phase.hint }}</span>
      </button>
    </div>

    <div v-if="exhaustedPhase" class="exhausted glass" role="alert">
      <p>
        As perguntas da <strong>Fase {{ exhaustedPhase }}</strong> acabaram nesta
        sessão. Reinicie a sessão para vê-las novamente.
      </p>
    </div>

    <div class="actions">
      <button class="reset-btn" type="button" @click="onReset">
        ↻ Reiniciar sessão
      </button>
    </div>
  </section>
</template>

<style scoped>
.phases {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  perspective: 1100px;
}

@media (max-width: 560px) {
  .phases {
    grid-template-columns: 1fr;
  }
}

.phase-card {
  --rx: 0deg;
  --ry: 0deg;
  --mx: 50%;
  --my: 50%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-5);
  min-height: 132px;
  color: var(--text);
  text-align: left;
  overflow: hidden;
  transform: rotateX(var(--rx)) rotateY(var(--ry));
  transform-style: preserve-3d;
  transition: transform 0.15s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.phase-card {
  border-color: var(--gold-border);
}

.phase-card:hover {
  border-color: var(--gold-border-strong);
  box-shadow: var(--shadow-md), var(--glow-gold);
}

/* Brilho dourado que segue o cursor (spotlight discreto). */
.phase-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(
    240px circle at var(--mx) var(--my),
    color-mix(in srgb, var(--gold) 18%, transparent),
    transparent 60%
  );
  transition: opacity 0.3s ease;
}

.phase-card:hover .phase-glow {
  opacity: 1;
}

/* Crachá numérico em SVG (hexágono dourado). */
.phase-badge {
  width: 52px;
  height: 52px;
  margin-bottom: var(--space-1);
  overflow: visible;
}

.phase-badge__hex {
  fill: none;
  stroke: var(--gold);
  stroke-linejoin: round;
  transition: stroke 0.25s ease, filter 0.25s ease;
}

.phase-badge__hex--outer {
  stroke-width: 2;
  fill: color-mix(in srgb, var(--gold) 7%, transparent);
}

.phase-badge__hex--inner {
  stroke-width: 1;
  stroke: var(--gold-border);
}

.phase-badge__num {
  fill: var(--gold-2);
  font-size: 26px;
  font-weight: 800;
  font-family: inherit;
}

.phase-card:hover .phase-badge__hex--outer {
  filter: drop-shadow(var(--glow-gold));
  stroke: var(--gold-2);
}

.phase-label {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.phase-hint {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.exhausted {
  margin-top: var(--space-5);
  padding: var(--space-4) var(--space-5);
  border-color: var(--border-strong);
}

.exhausted p {
  margin: 0;
}

.actions {
  margin-top: var(--space-6);
  text-align: center;
}

.reset-btn {
  padding: var(--space-3) var(--space-5);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--gold-soft);
  transition: color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}

.reset-btn:hover {
  color: var(--gold-2);
  border-color: var(--gold-border-strong);
  transform: translateY(-2px);
}
</style>
