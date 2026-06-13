<script setup>
// Camada de partículas de fundo do tema Laboratório: rede de pontos ciano
// (tipo átomos/conexões) reagindo suavemente ao cursor. Calibrado para ser
// discreto — densidade e opacidade baixas, conforme "calm interfaces".
const options = {
  fpsLimit: 60,
  detectRetina: true,
  fullScreen: { enable: false },
  background: { color: 'transparent' },
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'grab' },
      onClick: { enable: true, mode: 'push' },
      resize: { enable: true },
    },
    modes: {
      grab: { distance: 150, links: { opacity: 0.35 } },
      push: { quantity: 2 },
    },
  },
  particles: {
    number: { value: 46, density: { enable: true, width: 1100, height: 1100 } },
    color: { value: '#f5c518' },
    shape: { type: 'circle' },
    opacity: { value: 0.4 },
    size: { value: { min: 1, max: 2.2 } },
    links: {
      enable: true,
      distance: 140,
      color: '#d8ab1f',
      opacity: 0.18,
      width: 1,
    },
    move: {
      enable: true,
      speed: 0.8,
      direction: 'none',
      outModes: { default: 'bounce' },
      random: false,
    },
  },
}
</script>

<template>
  <div class="bg-fx" aria-hidden="true">
    <vue-particles id="bg-particles" class="bg-fx__canvas" :options="options" />
  </div>
</template>

<style scoped>
.bg-fx {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.bg-fx__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
}
</style>
