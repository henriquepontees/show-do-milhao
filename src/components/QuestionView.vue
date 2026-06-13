<script setup>
import { nextTick, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { useSession } from '../composables/useSession.js'
import { celebrate } from '../composables/useConfetti.js'

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

const { registerResult } = useSession()

const selected = ref(null) // índice da alternativa escolhida
const revealed = ref(false)
const wasCorrect = ref(false)

const sectionEl = ref(null)

const LETTERS = ['A', 'B', 'C', 'D']

// Entrada encenada: enunciado + alternativas escalonadas.
onMounted(() => {
  if (!sectionEl.value) return
  const enunciado = sectionEl.value.querySelector('.enunciado')
  const options = sectionEl.value.querySelectorAll('.option')
  gsap
    .timeline()
    .from(enunciado, { y: 24, opacity: 0, duration: 0.5, ease: 'power3.out' })
    .from(
      options,
      { y: 20, opacity: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' },
      '-=0.2',
    )
})

function select(index) {
  if (revealed.value) return
  selected.value = index
}

async function confirm() {
  if (selected.value === null || revealed.value) return
  revealed.value = true
  wasCorrect.value = selected.value === props.question.correta
  registerResult(wasCorrect.value)

  await nextTick()
  const els = sectionEl.value?.querySelectorAll('.option')
  if (!els) return

  if (wasCorrect.value) {
    celebrate()
    gsap.fromTo(
      els[props.question.correta],
      { scale: 1 },
      { scale: 1.04, duration: 0.25, yoyo: true, repeat: 1, ease: 'power1.inOut' },
    )
  } else {
    // Treme a alternativa errada escolhida.
    if (selected.value != null && els[selected.value]) {
      gsap.fromTo(
        els[selected.value],
        { x: -8 },
        { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' },
      )
    }
  }
}

// Classe de cada alternativa após revelar.
function optionClass(index) {
  if (!revealed.value) {
    return selected.value === index ? 'is-selected' : ''
  }
  if (index === props.question.correta) return 'is-correct'
  if (index === selected.value) return 'is-wrong'
  return 'is-dimmed'
}

function onBack() {
  emit('back')
}

function onContinue() {
  emit('continue')
}
</script>

<template>
  <section ref="sectionEl" class="question glass">
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
          <span class="option-letter">{{ LETTERS[index] }}</span>
          <span class="option-text">{{ alt }}</span>
        </button>
      </li>
    </ul>

    <div class="actions">
      <template v-if="!revealed">
        <button class="btn btn-ghost" type="button" @click="onBack">Voltar</button>
        <button
          class="btn btn-primary"
          type="button"
          :disabled="selected === null"
          @click="confirm"
        >
          Confirmar
        </button>
      </template>
      <button v-else class="btn btn-primary" type="button" @click="onContinue">
        Continuar →
      </button>
    </div>
  </section>
</template>

<style scoped>
.question {
  padding: var(--space-6);
  border-color: var(--gold-border);
}

.phase-tag {
  margin: 0 0 var(--space-3);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--gold);
}

.enunciado {
  margin: 0 0 var(--space-6);
  font-size: clamp(1.2rem, 3vw, 1.45rem);
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.2px;
  color: var(--gold-soft);
}

.options {
  list-style: none;
  margin: 0 0 var(--space-5);
  padding: 0;
  display: grid;
  gap: var(--space-3);
}

.option {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--gold-soft);
  text-align: left;
  transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease,
    transform 0.15s ease, color 0.2s ease;
}

.option:not(:disabled):hover {
  background: color-mix(in srgb, var(--gold) 11%, var(--surface));
  border-color: var(--gold-border-strong);
  box-shadow: var(--glow-gold);
  color: var(--gold-2);
  transform: translateY(-2px);
}

.option.is-selected {
  border-color: var(--gold-border-strong);
  background: color-mix(in srgb, var(--gold) 14%, var(--surface));
  color: var(--gold-2);
  box-shadow: var(--glow-gold);
}

/* Resposta correta destacada em verde. */
.option.is-correct {
  border-color: var(--green-border);
  background: var(--green);
  color: #fff;
  box-shadow: 0 0 20px -4px rgba(34, 197, 94, 0.55);
}

.option.is-correct .option-letter,
.option.is-wrong .option-letter {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

/* Alternativa errada escolhida. */
.option.is-wrong {
  border-color: var(--red);
  background: color-mix(in srgb, var(--red) 35%, transparent);
  color: #fff;
}

.option.is-dimmed {
  opacity: 0.5;
}

.option:disabled {
  opacity: 1;
}

.option.is-dimmed:disabled {
  opacity: 0.5;
}

.option-letter {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 50%;
  background: color-mix(in srgb, var(--gold) 10%, transparent);
  color: var(--gold-2);
  font-weight: 700;
  font-size: 0.9rem;
}

.option-text {
  flex: 1;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-4);
  margin-top: var(--space-7);
}

.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-weight: 700;
  transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.btn-ghost {
  background: transparent;
  border-color: var(--gold-border);
  color: var(--gold-soft);
}

.btn-ghost:hover {
  color: var(--gold-2);
  border-color: var(--gold-border-strong);
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, var(--gold), var(--gold-2));
  color: #1d1500;
  box-shadow: var(--glow-gold);
}

.btn-primary:not(:disabled):hover {
  filter: brightness(1.08);
  transform: translateY(-2px);
}
</style>
