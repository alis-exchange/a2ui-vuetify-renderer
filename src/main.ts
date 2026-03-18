import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import A2UiVueRenderer from './A2UIRendererPlugin'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
})

createApp(App)
  .use(vuetify)
  .use(A2UiVueRenderer)
  .mount('#app')
