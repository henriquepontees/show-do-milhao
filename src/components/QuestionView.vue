<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
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

const emit = defineEmits(['back', 'continue', 'measure'])

const { registerResult } = useSession()

const selected = ref(null) // índice da alternativa escolhida
const revealed = ref(false)
const wasCorrect = ref(false)

// Carta de ajuda: índices de alternativas (erradas) eliminadas + modal aberto.
const eliminated = ref(new Set())
const showHelp = ref(false)

const sectionEl = ref(null)

const LETTERS = ['A', 'B', 'C', 'D']

// Quantas alternativas erradas ainda podem ser eliminadas (a correta nunca conta).
const remainingWrong = computed(() => {
  const q = props.question
  if (!q || !Array.isArray(q.alternativas)) return 0
  let count = 0
  q.alternativas.forEach((_, i) => {
    if (i !== q.correta && !eliminated.value.has(i)) count++
  })
  return count
})

// Entrada encenada: enunciado + alternativas escalonadas.
// Animamos só o deslize (y), NÃO a opacidade — animar opacidade com .from()
// deixava os elementos presos em opacity:0 (invisíveis, porém clicáveis). O fade
// suave do bloco inteiro continua vindo da <Transition> do App.vue.
onMounted(() => {
  const root = sectionEl.value
  if (!root) return
  const enunciado = root.querySelector('.enunciado')
  const options = root.querySelectorAll('.option')
  gsap
    .timeline()
    .from(enunciado, { y: 20, duration: 0.45, ease: 'power3.out', clearProps: 'transform' })
    .from(
      options,
      { y: 16, duration: 0.4, stagger: 0.07, ease: 'power2.out', clearProps: 'transform' },
      '-=0.2',
    )

  // Casa a altura do card de prêmio (em App.vue) com a do card da pergunta.
  resizeObserver = new ResizeObserver(() => emit('measure', root.offsetHeight))
  resizeObserver.observe(root)
})

let resizeObserver = null
onBeforeUnmount(() => resizeObserver?.disconnect())

function select(index) {
  if (revealed.value || eliminated.value.has(index)) return
  selected.value = index
}

// Usa uma carta: elimina `n` alternativas ERRADAS sorteadas (a correta é poupada).
function useCard(n) {
  const q = props.question
  const wrong = []
  q.alternativas.forEach((_, i) => {
    if (i !== q.correta && !eliminated.value.has(i)) wrong.push(i)
  })
  // Embaralha as erradas disponíveis (Fisher–Yates).
  for (let i = wrong.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[wrong[i], wrong[j]] = [wrong[j], wrong[i]]
  }
  const next = new Set(eliminated.value)
  wrong.slice(0, n).forEach((i) => next.add(i))
  eliminated.value = next

  // Se a alternativa selecionada foi eliminada, limpa a seleção.
  if (selected.value !== null && next.has(selected.value)) selected.value = null

  showHelp.value = false
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

// Classe de cada alternativa.
function optionClass(index) {
  if (!revealed.value) {
    if (eliminated.value.has(index)) return 'is-eliminated'
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
          :disabled="revealed || eliminated.has(index)"
          @click="select(index)"
        >
          <span class="option-letter">{{ LETTERS[index] }}</span>
          <span class="option-text">{{ alt }}</span>
        </button>
      </li>
    </ul>

    <div class="actions">
      <template v-if="!revealed">
        <button
          class="btn btn-help"
          type="button"
          :disabled="remainingWrong === 0"
          title="Carta de ajuda — eliminar alternativas"
          aria-label="Carta de ajuda"
          @click="showHelp = true"
        >
          <svg class="help-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3.5" y="7" width="11" height="14.5" rx="2" transform="rotate(-11 9 14)" />
            <rect x="9" y="3.5" width="11" height="14.5" rx="2" fill="var(--surface)" />
            <path d="M14.5 8v5M12 10.5h5" />
          </svg>
        </button>

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

    <!-- Modal das cartas: Teleport DENTRO da raiz <section> para não quebrar a
         <Transition> do App.vue (que exige um único nó-raiz no componente). -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showHelp" class="help-overlay" @click.self="showHelp = false">
          <div
            class="help-modal glass"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
          >
            <h3 id="help-title" class="help-title">Carta de ajuda</h3>
            <p class="help-desc">Quantas alternativas erradas deseja eliminar?</p>

            <div class="help-choices">
              <button
                v-for="n in 3"
                :key="n"
                class="help-choice"
                type="button"
                :disabled="n > remainingWrong"
                @click="useCard(n)"
              >
                <span class="help-choice__num">{{ n }}</span>
                <span class="help-choice__label">{{ n === 1 ? 'erro' : 'erros' }}</span>
              </button>
            </div>

            <button class="help-cancel" type="button" @click="showHelp = false">
              Cancelar
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
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
    transform 0.15s ease, color 0.2s ease, opacity 0.25s ease;
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

/* Alternativa eliminada por uma carta de ajuda. */
.option.is-eliminated {
  opacity: 0.3;
  text-decoration: line-through;
  filter: grayscale(0.6);
}

.option:disabled {
  opacity: 1;
}

.option.is-dimmed:disabled {
  opacity: 0.5;
}

.option.is-eliminated:disabled {
  opacity: 0.3;
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
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-4);
  margin-top: var(--space-7);
}

.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-weight: 700;
  transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease,
    border-color 0.2s ease, color 0.2s ease;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-ghost {
  background: transparent;
  border-color: var(--gold-border);
  color: var(--gold-soft);
}

.btn-ghost:not(:disabled):hover {
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

/* Botão da carta de ajuda — ícone, alinhado à esquerda. */
.btn-help {
  margin-right: auto; /* empurra Voltar/Confirmar para a direita */
  display: grid;
  place-items: center;
  padding: var(--space-3);
  width: 2.85rem;
  height: 2.85rem;
  background: transparent;
  border-color: var(--gold-border);
  color: var(--gold);
}

.btn-help:not(:disabled):hover {
  color: var(--gold-2);
  border-color: var(--gold-border-strong);
  box-shadow: var(--glow-gold);
  transform: translateY(-2px);
}

.help-icon {
  width: 1.4rem;
  height: 1.4rem;
}

/* ----- Modal das cartas ----- */
.help-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: var(--space-5);
  background: rgba(8, 7, 3, 0.66);
  backdrop-filter: blur(4px);
}

.help-modal {
  width: min(380px, 100%);
  padding: var(--space-6);
  text-align: center;
  border-color: var(--gold-border-strong);
  box-shadow: var(--shadow-md), var(--glow-gold);
}

.help-title {
  margin: 0 0 var(--space-2);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.2px;
  color: var(--gold-2);
}

.help-desc {
  margin: 0 0 var(--space-5);
  color: var(--gold-soft);
  font-size: 0.95rem;
}

.help-choices {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.help-choice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-4) var(--space-2);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--gold-soft);
  transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease,
    transform 0.15s ease, color 0.18s ease;
}

.help-choice:not(:disabled):hover {
  background: color-mix(in srgb, var(--gold) 14%, var(--surface));
  border-color: var(--gold-border-strong);
  box-shadow: var(--glow-gold);
  color: var(--gold-2);
  transform: translateY(-2px);
}

.help-choice:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.help-choice__num {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--gold-2);
  line-height: 1;
}

.help-choice__label {
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.help-cancel {
  width: 100%;
  padding: var(--space-3);
  background: transparent;
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-sm);
  color: var(--gold-soft);
  transition: color 0.18s ease, border-color 0.18s ease;
}

.help-cancel:hover {
  color: var(--gold-2);
  border-color: var(--gold-border-strong);
}

/* Transição do modal. */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .help-modal,
.modal-leave-active .help-modal {
  transition: transform 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .help-modal,
.modal-leave-to .help-modal {
  transform: translateY(16px) scale(0.96);
}
</style>
