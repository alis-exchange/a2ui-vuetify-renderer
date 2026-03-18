<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MessageProcessor, Catalog } from '@a2ui/web_core/v0_9';
import A2UIProvider from './composables/A2UIProvider.vue';
import ComponentNode from './core/ComponentNode.vue';
import type { Action } from '@a2ui/web_core/v0_9/schema';

const handleAction = (action: Action) => {
  console.log('Action triggered:', action);
};

const mockCatalog = new Catalog('https://a2ui.org/specification/v0_9/basic_catalog.json', []);
const processor = new MessageProcessor([mockCatalog], handleAction);
const surfaceId = 'mock-surface';
const isReady = ref(false);
const errorMsg = ref('');

onMounted(async () => {
  try {
    processor.processMessages([{
      createSurface: {
        surfaceId,
        catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
        theme: {
          primaryColor: '#00C853', // A distinct green color
          errorColor: '#D50000'
        }
      }
    }]);

    processor.processMessages([{
      updateComponents: {
        surfaceId,
        components: [
          {
            id: 'root',
            component: 'Column',
            children: ['title', 'divider1', 'btnGroup']
          },
          {
            id: 'title',
            component: 'Text',
            text: 'A2UI Surface with Green Theme Override',
            variant: 'h5'
          },
          {
            id: 'divider1',
            component: 'Divider',
            axis: 'horizontal'
          },
          {
            id: 'btnGroup',
            component: 'Row',
            children: ['submitBtn', 'errorBtn']
          },
          {
            id: 'submitBtn',
            component: 'Button',
            variant: 'primary',
            child: 'btnText',
            action: { event: { name: 'submit' } }
          },
          {
            id: 'btnText',
            component: 'Text',
            text: 'A2UI Primary Button (Should be Green)'
          },
          {
            id: 'errorBtn',
            component: 'Button',
            child: 'errorBtnText',
            action: { event: { name: 'error' } }
          },
          {
            id: 'errorBtnText',
            component: 'Text',
            text: 'Test Button'
          }
        ]
      }
    }]);
    
    isReady.value = true;
  } catch (err: any) {
    console.error('Failed to load mock surface:', err);
    errorMsg.value = err.message || String(err);
  }
});
</script>

<template>
  <v-app class="w-100 h-100">
    <v-main class="pa-4 w-100 h-100" style="background-color: white; color: black;">
      <div v-if="errorMsg" style="color: red; border: 2px solid red; padding: 20px; font-weight: bold; background-color: #ffebee; border-radius: 8px;">
        <h2>Error Loading Surface</h2>
        <p>{{ errorMsg }}</p>
      </div>
      <div v-else-if="!isReady" style="padding: 20px;">
        Loading A2UI Surface...
      </div>
      <template v-else>
        <div style="background: #e0e0e0; padding: 10px; margin-bottom: 20px; border-radius: 4px;">
          <h3>Host Application (Global Theme)</h3>
          <p>This button uses the default global Vuetify primary color (usually blue). It should NOT be green.</p>
          <v-btn color="primary" class="mt-2">Global Primary Button</v-btn>
        </div>
        
        <div style="border: 2px dashed #00C853; padding: 10px; border-radius: 4px;">
          <A2UIProvider :processor="processor" :surface-id="surfaceId" :on-action="handleAction" class="w-100 h-100">
            <ComponentNode id="root" />
          </A2UIProvider>
        </div>
      </template>
    </v-main>
  </v-app>
</template>

<style>
/* Provide a dark/light background based on Vuetify theme if desired */
</style>
