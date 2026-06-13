<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import gsap from 'gsap'
import { useSession } from '../composables/useSession.js'

const { level, score, PRIZES } = useSession()

// Formato curto estilo locução: "R$ 1 mil", "R$ 100 mil", "R$ 1 milhão".
function formatPrize(v) {
  if (v >= 1_000_000) return `R$ ${v / 1_000_000} milhão`
  return `R$ ${v / 1000} mil`
}

// Degraus do topo (maior prêmio) para baixo.
const steps = computed(() =>
  PRIZES.map((value, index) => ({ value, index })).reverse(),
)

const nextPrize = computed(() =>
  level.value + 1 < PRIZES.length ? PRIZES[level.value + 1] : null,
)
const progress = computed(() => ((level.value + 1) / PRIZES.length) * 100)
const scoreLabel = computed(() =>
  level.value < 0 ? 'R$ 0' : formatPrize(score.value),
)

const listEl = ref(null)

function stepClass(index) {
  if (index <= level.value) return 'is-won'
  if (index === level.value + 1) return 'is-target'
  return ''
}

// Anima o degrau recém-conquistado e o traz para a área visível.
watch(level, async (next, prev) => {
  if (next <= prev) return
  await nextTick()
  const el = listEl.value?.querySelector(`[data-step="${next}"]`)
  if (!el) return
  el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  gsap.fromTo(
    el,
    { scale: 0.8 },
    { scale: 1, duration: 0.5, ease: 'back.out(2)', clearProps: 'scale' },
  )
})
</script>

<template>
  <aside class="ladder glass" aria-label="Escada de prêmios">
    <header class="ladder__head">
      <span class="ladder__caption">Prêmio acumulado</span>
      <strong class="ladder__score">{{ scoreLabel }}</strong>
    </header>

    <!-- Resumo + barra de progresso: visível em telas estreitas. -->
    <div class="ladder__summary">
      <span class="ladder__next">
        {{ nextPrize ? `Próximo: ${formatPrize(nextPrize)}` : '🏆 Você chegou ao topo!' }}
      </span>
      <div class="ladder__bar" role="progressbar" :aria-valuenow="Math.round(progress)">
        <span class="ladder__bar-fill" :style="{ width: `${progress}%` }" />
      </div>
    </div>

    <ol ref="listEl" class="ladder__list">
      <li
        v-for="step in steps"
        :key="step.index"
        :data-step="step.index"
        class="ladder__step"
        :class="stepClass(step.index)"
      >
        <span class="ladder__num">{{ step.index + 1 }}</span>
        <span class="ladder__value">{{ formatPrize(step.value) }}</span>
      </li>
    </ol>
  </aside>
</template>

<style scoped>
.ladder {
  padding: var(--space-4);
  width: 100%;
  border-color: var(--gold-border);
}

.ladder__head {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--gold-border);
}

.ladder__caption {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--text-faint);
}

.ladder__score {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--gold);
  font-variant-numeric: tabular-nums;
}

/* Resumo (só aparece em telas estreitas). */
.ladder__summary {
  display: none;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.ladder__next {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
}

.ladder__bar {
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.ladder__bar-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--gold), var(--gold-2));
  transition: width 0.5s ease;
}

.ladder__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  max-height: calc(100vh - 9rem);
  overflow-y: auto;
  scrollbar-width: thin;
}

.ladder__step {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  color: var(--text-muted);
  transition: color 0.25s ease, background 0.25s ease, border-color 0.25s ease;
}

.ladder__num {
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  flex: 0 0 auto;
  border-radius: 50%;
  background: color-mix(in srgb, var(--gold) 10%, transparent);
  color: var(--gold-2);
  font-size: 0.72rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.ladder__value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gold-soft);
  font-variant-numeric: tabular-nums;
}

/* Degrau já conquistado. */
.ladder__step.is-won {
  color: var(--text);
  background: color-mix(in srgb, var(--gold) 12%, transparent);
}

.ladder__step.is-won .ladder__num {
  background: var(--gold);
  color: #1d1500;
}

.ladder__step.is-won .ladder__value {
  color: var(--gold-2);
}

/* Próximo alvo: destaque sutil com pulso discreto. */
.ladder__step.is-target {
  color: var(--text);
  border-color: var(--gold-border-strong);
  background: var(--surface);
  animation: ladder-pulse 2s ease-in-out infinite;
}

.ladder__step.is-target .ladder__num {
  background: color-mix(in srgb, var(--gold) 30%, transparent);
  color: var(--text);
}

@keyframes ladder-pulse {
  0%,
  100% {
    border-color: var(--gold-border);
  }
  50% {
    border-color: var(--gold-border-strong);
    box-shadow: var(--glow-gold);
  }
}

/* Telas estreitas: esconde a lista longa, mostra resumo + barra. */
@media (max-width: 820px) {
  .ladder__head {
    margin-bottom: var(--space-3);
  }

  .ladder__summary {
    display: flex;
  }

  .ladder__list {
    display: none;
  }
}
</style>
