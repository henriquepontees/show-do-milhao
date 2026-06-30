<script setup>
import { ref } from 'vue'
import { useSession } from './composables/useSession.js'
import BackgroundFX from './components/BackgroundFX.vue'
import PrizeLadder from './components/PrizeLadder.vue'
import PhaseSelect from './components/PhaseSelect.vue'
import QuestionView from './components/QuestionView.vue'

const { drawQuestion, resetSession } = useSession()

// Navegação entre as 2 telas: 'phase' (escolha de fase) e 'question'.
const screen = ref('phase')
const currentQuestion = ref(null)
const currentPhase = ref(null)
// Fase cuja oferta de perguntas se esgotou na sessão (mostra aviso na tela de fase).
const exhaustedPhase = ref(null)
// Altura da grade de fases (medida em PhaseSelect): o card de prêmio casa essa
// altura, para terminar exatamente na base dos cards de fase.
const ladderHeight = ref(null)

function onMeasure(height) {
  ladderHeight.value = height
}

function onSelectPhase(phase) {
  const question = drawQuestion(phase)
  if (!question) {
    exhaustedPhase.value = phase
    return
  }
  exhaustedPhase.value = null
  currentPhase.value = phase
  currentQuestion.value = question
  screen.value = 'question'
}

function backToPhases() {
  screen.value = 'phase'
  currentQuestion.value = null
  currentPhase.value = null
}

function onReset() {
  resetSession()
  exhaustedPhase.value = null
}
</script>

<template>
  <BackgroundFX />

  <header class="header">
    <p class="eyebrow">Quiz interativo</p>
    <h1 class="title">Show do Milhão</h1>
    <p class="subtitle">Escolha uma fase, suba na escada e fature o prêmio.</p>
  </header>

  <div class="layout">
    <main class="stage">
      <Transition name="screen" mode="out-in">
        <PhaseSelect
          v-if="screen === 'phase'"
          key="phase"
          :exhausted-phase="exhaustedPhase"
          @select="onSelectPhase"
          @reset="onReset"
          @measure="onMeasure"
        />

        <QuestionView
          v-else-if="screen === 'question'"
          key="question"
          :question="currentQuestion"
          :phase="currentPhase"
          @back="backToPhases"
          @continue="backToPhases"
          @measure="onMeasure"
        />
      </Transition>
    </main>

    <PrizeLadder
      class="side"
      :style="ladderHeight ? { '--ladder-h': ladderHeight + 'px' } : {}"
    />
  </div>
</template>

<style scoped>
.header {
  text-align: center;
  margin: var(--space-4) 0 var(--space-6);
}

.eyebrow {
  margin: 0 0 var(--space-2);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--gold);
}

.title {
  margin: 0;
  font-size: clamp(2rem, 6vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.05;
  background: linear-gradient(
    100deg,
    var(--gold) 0%,
    var(--gold-2) 40%,
    #fff7df 50%,
    var(--gold-2) 60%,
    var(--gold) 100%
  );
  background-size: 220% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: shimmer 7s linear infinite;
}

.subtitle {
  margin: var(--space-3) auto 0;
  max-width: 36ch;
  color: var(--gold-soft);
  font-size: 1rem;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 264px;
  gap: var(--space-6);
  align-items: start;
}

.side {
  /* Casa a altura da grade de fases (medida em PhaseSelect) — o card termina
     exatamente na base dos cards de fase e a lista de prêmios rola por dentro.
     Sem a medida (1º render), cai para auto. */
  height: var(--ladder-h, auto);
}

@media (max-width: 820px) {
  .layout {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }

  .side {
    height: auto;
    order: -1;
  }
}

/* Transição entre telas. */
.screen-enter-active,
.screen-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.screen-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.screen-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}
</style>
