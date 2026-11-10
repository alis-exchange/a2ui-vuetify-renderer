<script setup lang="ts">
  import type { ComponentModel } from '@a2ui/web_core/v0_9';
  import { computed, ref, watch } from 'vue';
  import { useA2UI } from '../composables/useA2UI';

  const props = defineProps<{
    node: ComponentModel;
  }>();

  const { resolveValue, dispatchNodeAction } = useA2UI();
  // Only the props this component reads: resolving every prop (useDynamicProps) would actively
  // evaluate `action` on each render, so an `openUrl` in it would fire while a gesture is active.
  const dynamicProps = computed(() => ({ tabs: resolveValue<{ title?: string; child?: string }[]>(props.node.properties.tabs) }));
  const tab = ref(0);

  watch(tab, (newTab) => {
    const tabItem = (dynamicProps.value.tabs || [])[newTab];
    dispatchNodeAction(props.node, {
      tabIndex: newTab,
      tabTitle: tabItem?.title,
    });
  });
</script>

<template>
  <div class="a2ui-tabs w-100">
    <v-tabs
      v-model="tab"
      color="primary"
    >
      <v-tab
        v-for="(item, index) in dynamicProps.tabs || []"
        :key="index"
        :value="index"
      >
        {{ item.title }}
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item
        v-for="(item, index) in dynamicProps.tabs || []"
        :key="index"
        :value="index"
      >
        <v-card flat>
          <A2uiComponentNode
            v-if="item.child"
            :id="item.child"
          />
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>
