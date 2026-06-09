<script setup>
import { ref } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  phase: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['back', 'continue'])

const selected = ref(null) // índice da alternativa escolhida
const revealed = ref(false)

function select(index) {
  if (revealed.value) return
  selected.value = index
}

function confirm() {
  if (selected.value === null) return
  revealed.value = true
}

// Classe de cada alternativa: destaca a correta em verde após revelar.
function optionClass(index) {
  if (!revealed.value) {
    return selected.value === index ? 'is-selected' : ''
  }
  return index === props.question.correta ? 'is-correct' : ''
}
</script>

<template>
  <section class="question">
    <p v-if="phase" class="phase-tag">Fase {{ phase }}</p>

    <h2 class="enunciado">{{ question.enunciado }}</h2>

    <ul class="options">
      <li v-for="(alt, index) in question.alternativas" :key="index">
        <button
          type="button"
          class="option"
          :class="optionClass(index)"
          :disabled="revealed"
          @click="select(index)"
        >
          <span class="option-letter">{{ ['A', 'B', 'C', 'D'][index] }}</span>
          <span class="option-text">{{ alt }}</span>
        </button>
      </li>
    </ul>

    <div class="actions">
      <template v-if="!revealed">
        <button class="btn btn-ghost" type="button" @click="emit('back')">
          Voltar
        </button>
        <button
          class="btn btn-primary"
          type="button"
          :disabled="selected === null"
          @click="confirm"
        >
          Confirmar
        </button>
      </template>
      <button v-else class="btn btn-primary" type="button" @click="emit('continue')">
        Continuar
      </button>
    </div>
  </section>
</template>

<style scoped>
.phase-tag {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--accent);
}

.enunciado {
  margin: 0 0 1.5rem;
  font-size: 1.4rem;
  line-height: 1.4;
}

.options {
  list-style: none;
  margin: 0 0 2rem;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

.option {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text);
  text-align: left;
  transition: background 0.12s ease, border-color 0.12s ease;
}

.option:not(:disabled):hover {
  background: var(--bg-card-2);
  border-color: var(--accent);
}

.option.is-selected {
  border-color: var(--accent);
  background: var(--bg-card-2);
}

/* Destaque verde da resposta correta (estilo Show do Milhão). */
.option.is-correct {
  border-color: var(--green-border);
  background: var(--green);
  color: #fff;
}

.option:disabled {
  opacity: 1; /* alternativas reveladas permanecem totalmente visíveis */
}

.option.is-correct .option-letter {
  background: rgba(255, 255, 255, 0.25);
}

.option-letter {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  font-weight: 700;
}

.option-text {
  flex: 1;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn {
  padding: 0.75rem 1.75rem;
  border-radius: 10px;
  border: 1px solid transparent;
  font-weight: 600;
}

.btn-ghost {
  background: transparent;
  border-color: var(--border);
  color: var(--text-muted);
}

.btn-ghost:hover {
  color: var(--text);
  border-color: var(--text-muted);
}

.btn-primary {
  background: var(--accent);
  color: #1a1a1a;
}

.btn-primary:not(:disabled):hover {
  filter: brightness(1.08);
}
</style>
