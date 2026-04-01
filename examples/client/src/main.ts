import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

// Vuetify
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';

// A2UI Vue Renderer
import { plugin as A2UiVueRenderer } from '@alis-build/a2ui-vuetify-renderer';
import '@alis-build/a2ui-vuetify-renderer/style.css';

const vuetify = createVuetify({
  components,
  directives,
});

const app = createApp(App);

app.use(vuetify);
app.use(A2UiVueRenderer);

app.mount('#app');
