import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

// A2UI Vue Renderer
import { plugin as A2UiVueRenderer } from '@alis-build/a2ui-vuetify-renderer'
import '@alis-build/a2ui-vuetify-renderer/style.css'

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)

app.use(vuetify)
app.use(A2UiVueRenderer)

app.mount('#app')