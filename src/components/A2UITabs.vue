<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useA2UI } from '../composables/useA2UI';
  import { useDynamicProps } from '../composables/useDynamicProps';

  const props = defineProps<{
    node: any;
  }>();

  const dynamicProps = useDynamicProps(() => props.node);
  const { dispatchNodeAction } = useA2UI();
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
