import { reactive, ref } from 'vue'
import questions from '../data/questions.json'

/**
 * Sessão de jogo em memória (não persiste entre recarregamentos da página).
 * Mantém, por fase, o conjunto de ids de perguntas já servidas para evitar
 * repetição dentro da mesma sessão.
 *
 * O estado vive no escopo do módulo (singleton), então é compartilhado por
 * todos os componentes que importam este composable.
 */

export const PHASES = ['1', '2', '3', '4']

// Conjunto de ids já vistos por fase. reactive() para que a UI reaja ao reset.
const seen = reactive({
  1: new Set(),
  2: new Set(),
  3: new Set(),
  4: new Set(),
})

// Progressão da escada de prêmios.
// level = índice do degrau já conquistado (-1 = nenhum ainda); score = R$ acumulado.
const level = ref(-1)
const score = ref(0)

// Escada de prêmios (R$). Exportada para o componente PrizeLadder e o cálculo de score.
export const PRIZES = [
  1000, 2000, 3000, 4000, 5000,
  10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000,
  200000, 300000, 400000, 500000, 1000000,
]

/**
 * Registra o resultado de uma resposta, avançando a escada em caso de acerto.
 * @param {boolean} correct - se o jogador acertou.
 */
function registerResult(correct) {
  if (correct && level.value < PRIZES.length - 1) {
    level.value += 1
    score.value = PRIZES[level.value]
  }
}

/**
 * Sorteia uma pergunta ainda não vista da fase informada.
 * @param {string|number} phase - número da fase (1–4)
 * @returns {object|null} a pergunta sorteada, ou null se a fase esgotou.
 */
function drawQuestion(phase) {
  const pool = questions[phase] || []
  const remaining = pool.filter((q) => !seen[phase].has(q.id))

  if (remaining.length === 0) return null

  const picked = remaining[Math.floor(Math.random() * remaining.length)]
  seen[phase].add(picked.id)
  return picked
}

/**
 * Zera o histórico de perguntas vistas em todas as fases (nova sessão).
 */
function resetSession() {
  for (const phase of PHASES) {
    seen[phase].clear()
  }
  level.value = -1
  score.value = 0
}

export function useSession() {
  return { seen, level, score, drawQuestion, resetSession, registerResult, PRIZES }
}
