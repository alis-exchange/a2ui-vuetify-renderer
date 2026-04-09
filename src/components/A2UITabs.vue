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

<script lang="ts">
  import { ActionSchema, ComponentIdSchema, DynamicStringSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
  import { z } from 'zod';
  import { CommonProps } from '../catalog/common-props';

  export const TabsApi: ComponentApi = {
    name: 'Tabs',
    schema: z
      .object({
        ...CommonProps,
        tabs: z
          .array(
            z
              .object({
                title: DynamicStringSchema,
                child: ComponentIdSchema,
              })
              .strict(),
          )
          .min(1),
        action: ActionSchema.optional(),
      })
      .strict(),
  };
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
