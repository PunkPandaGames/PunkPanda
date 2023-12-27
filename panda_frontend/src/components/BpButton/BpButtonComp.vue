<script setup lang="ts">
import { useAppStore } from '@store/appStore';
const appStore = useAppStore();

const props = defineProps<{
  disable?: boolean; // disable
  sink: boolean; // sink
}>();

const emits = defineEmits<{
  (click: 'click'): MouseEvent;
}>();


async function handleSwitchChain() {
  if (props.disable) return;

  emits('click');
}
</script>

<template>
  <!-- connect wallet -->
  <button
    :class="['write-btn func-btn', { disable: props.disable, sink: props.sink }]"
    @click="handleSwitchChain"
  >
    <template v-loading="loadSwitch" v-if="!appStore.rightChain || !appStore.defaultAccount">
      <slot></slot>
    </template>

    <!-- account addr -->
    <template v-else>
      <slot></slot>
    </template>
  </button>
</template>

<style lang="scss" scoped>
.write-btn {
  text-align: center;
  padding-top: 7rem;
}
</style>
