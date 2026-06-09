<script setup>
defineProps({
  // Número da fase que esgotou na sessão, ou null.
  exhaustedPhase: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['select', 'reset'])

const phases = [
  { id: '1', label: 'Fase 1', hint: 'Fácil' },
  { id: '2', label: 'Fase 2', hint: 'Médio' },
  { id: '3', label: 'Fase 3', hint: 'Difícil' },
  { id: '4', label: 'Fase 4', hint: 'Muito difícil' },
]
</script>

<template>
  <section>
    <div class="phases">
      <button
        v-for="phase in phases"
        :key="phase.id"
        class="phase-card"
        type="button"
        @click="emit('select', phase.id)"
      >
        <span class="phase-label">{{ phase.label }}</span>
        <span class="phase-hint">{{ phase.hint }}</span>
      </button>
    </div>

    <div v-if="exhaustedPhase" class="exhausted" role="alert">
      <p>
        As perguntas da <strong>Fase {{ exhaustedPhase }}</strong> acabaram nesta
        sessão. Reinicie a sessão para vê-las novamente.
      </p>
    </div>

    <div class="actions">
      <button class="reset-btn" type="button" @click="emit('reset')">
        Reiniciar sessão
      </button>
    </div>
  </section>
</template>

<style scoped>
.phases {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 480px) {
  .phases {
    grid-template-columns: 1fr;
  }
}

.phase-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text);
  text-align: left;
  transition: transform 0.12s ease, background 0.12s ease, border-color 0.12s ease;
}

.phase-card:hover {
  background: var(--bg-card-2);
  border-color: var(--accent);
  transform: translateY(-2px);
}

.phase-label {
  font-size: 1.25rem;
  font-weight: 700;
}

.phase-hint {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.exhausted {
  margin-top: 1.5rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--accent);
  border-radius: 10px;
  background: rgba(245, 197, 24, 0.08);
}

.exhausted p {
  margin: 0;
}

.actions {
  margin-top: 2rem;
  text-align: center;
}

.reset-btn {
  padding: 0.7rem 1.4rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: transparent;
  color: var(--text-muted);
  transition: color 0.12s ease, border-color 0.12s ease;
}

.reset-btn:hover {
  color: var(--text);
  border-color: var(--text-muted);
}
</style>
