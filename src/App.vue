<script setup>
import { ref } from 'vue'
import { useSession } from './composables/useSession.js'
import PhaseSelect from './components/PhaseSelect.vue'
import QuestionView from './components/QuestionView.vue'

const { drawQuestion, resetSession } = useSession()

// Navegação entre as 2 telas: 'phase' (escolha de fase) e 'question'.
const screen = ref('phase')
const currentQuestion = ref(null)
const currentPhase = ref(null)
// Fase cuja oferta de perguntas se esgotou na sessão (mostra aviso na tela de fase).
const exhaustedPhase = ref(null)

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
  <header class="header">
    <h1>Show do Milhão</h1>
    <p class="subtitle">Escolha uma fase e responda a pergunta.</p>
  </header>

  <main>
    <PhaseSelect
      v-if="screen === 'phase'"
      :exhausted-phase="exhaustedPhase"
      @select="onSelectPhase"
      @reset="onReset"
    />

    <QuestionView
      v-else-if="screen === 'question'"
      :question="currentQuestion"
      :phase="currentPhase"
      @back="backToPhases"
      @continue="backToPhases"
    />
  </main>
</template>

<style scoped>
.header {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  margin: 0;
  font-size: 2.25rem;
  letter-spacing: 0.5px;
  color: var(--accent);
  text-shadow: 0 2px 12px rgba(245, 197, 24, 0.25);
}

.subtitle {
  margin: 0.5rem 0 0;
  color: var(--text-muted);
}
</style>
