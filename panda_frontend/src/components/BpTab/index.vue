<script setup lang="ts">
const props = defineProps<{
  tabs: ITab[]; // content
  fontSize?: string; // fontSize
  color?: string; // color
  activeColor?: string; // active Color
  squareColor?: string; // square Color
  type?: "wall"; //  wall: add border
  gapWall?: boolean; // gap
  gap?: string; 
  capsule?: boolean; // capsule
  eqDivi?: boolean; // eq Divi
  pos?: "left" | "center" | "right"; 
  squarePadding?: number; 
}>();

const emits = defineEmits<{
  (pickTab: "pickTab", item: ITab, newTabs: ITab[]): MouseEvent;
}>();

const tabWrap = ref<HTMLElement>(null);
const barLeft = ref<number>(0); 
const barWidth = ref<number>(0);

const doPickTab = (item, e) => {
  if (item.disable) return;

  const newTabs = props.tabs.map((t, i) => {
    t.active = t.id === item.id;
    return t;
  });
  emits("pickTab", item, newTabs);
};

const firstDom = ref(null);

const initFirstDOM = () => {
  const activeInx = props.tabs.findIndex((item) => item.active) || 0;
  firstDom.value = tabWrap.value.getElementsByClassName("tab-item")[activeInx];
  const offsetLeft = firstDom.value.offsetLeft;
  const w = +getComputedStyle(firstDom.value).width.replace("px", "");
  barWidth.value = w;
  barLeft.value = offsetLeft;
};
nextTick(() => {
  initFirstDOM();
});

defineExpose({
  initFirstDOM,
});


const activeColor = computed(() => props.activeColor ?? "#fff");

const squarePadding = reactive({
  w: 8,
  l: 4,
});


watch(props.tabs, (val) => {
  const activeItemInx = val.findIndex((item) => item.active);
  firstDom.value = tabWrap.value.getElementsByClassName("tab-item")[activeItemInx];
  barLeft.value = firstDom.value?.offsetLeft;
  barWidth.value = firstDom.value?.offsetWidth;
  

  if (activeItemInx == 1) {
    squarePadding.w = props.squarePadding;
    squarePadding.l = - props.squarePadding - 6;
  } else {
    squarePadding.w = props.squarePadding;
    squarePadding.l = props.squarePadding / 2;
  }
});
</script>

<template>
  <div :class="['tabs-wrap', props.pos]" ref="tabWrap">
    <div
      :class="[
        'tab-item',
        { active: t.active, gapWall: props.gapWall, 'eq-divi': props.eqDivi },
      ]"
      :style="{
        fontSize: props.fontSize ?? '14rem',
        marginLeft: props.gap ?? '11rem',
        color: props.color ?? '#fff',
      }"
      v-for="t in props.tabs"
      :key="t.id"
      @click="doPickTab(t, $event)"
    >
      {{ t.text }}
    </div>

    <!-- capsule -->
    <div
      v-if="props.capsule"
      className="cap-bar bar top-10 h-full"
      :style="{
        left: barLeft + squarePadding.l + 'px',
        width: barWidth + squarePadding.w + 'px',
        background:
          props.squareColor || 'linear-gradient(45deg, #e942b4 0%, #1e46d4 100%)',
      }"
    ></div>

    <!-- line -->
    <div
      v-else
      className="slide-bar bar bottom-0 h-20rem"
      :style="{
        left: barLeft + 'px',
        width: barWidth + 'px',
        background:
          props.squareColor || 'linear-gradient(45deg, #e942b4 0%, #1e46d4 100%)',
      }"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
.tabs-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 70rem;
  border-radius: 10rem;
  background-color: #2c2d31;
  position: relative;

  &.left {
    justify-content: flex-start;
  }
  &.right {
    justify-content: flex-end;
  }

  > .bar {
    position: absolute;
    left: 0;
    transition: all 0.8s;
    z-index: 1;

    &.cap-bar {
      width: 120rem;
      height: 54rem;
      border-radius: 10rem;
    }

    &.slide-bar {
    }
  }

  .tab-item {
    text-align: center;
    cursor: pointer;
    z-index: 2;
    position: relative;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20rem;
    // margin-bottom: 6rem;

    &:first-child {
      margin-left: 0 !important;
    }

    &.gapWall:not(:last-child) {
      border-right: solid 1px #949eab;
    }

    &.eq-divi {
      flex: 1;
    }

    &.active {
      color: v-bind(activeColor) !important;
    }
  }
}
</style>
