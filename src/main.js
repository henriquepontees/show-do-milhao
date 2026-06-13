import { createApp } from 'vue'
import { MotionPlugin } from '@vueuse/motion'
import Particles from '@tsparticles/vue3'
import { loadSlim } from '@tsparticles/slim'
import App from './App.vue'
import './style.css'

const app = createApp(App)

app.use(MotionPlugin)
app.use(Particles, {
  init: async (engine) => {
    await loadSlim(engine)
  },
})

app.mount('#app')
