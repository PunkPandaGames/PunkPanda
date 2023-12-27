<script setup lang="ts">
import emitter from "@/utils/mitt";

const props = defineProps<{
  width?: string; 
  height?: sting; 
  taskAmount?: string; 
  progress?: number; 
  vertical?: boolean; 
  label?: boolean; 
}>();

const curProgress = ref(5);


onMounted(() => {
  emitter.on("curProgress", (item) => {
    console.log("curProgress ...", item);
    if (item.type == "horizontal") {
      if (+item.val < 6) {
        curProgress.value = 5;
      } else {
        curProgress.value = item.val;
      }
    } else if (item.type == 'vertical') {
      curProgress.value = item.val;
    }
  });
});

// off 
onUnmounted(() => {
  emitter.off("curProgress", () => {
    null;
  });
});
</script>

<template>
  <div class="progress-wrap">
    <div class="flex justify-between mb-19" v-if="label">
      <span class="text-24 text-white">{{+curProgress > 5 ? '0' : ' '}}</span>
      <span class="text-24 text-white" v-if="+curProgress < 95">{{ `${taskAmount} VIC` }}</span>
    </div>
    <div class="w-10 h-389 bg-white rounded-full flex flex-col-reverse" v-if="vertical">
      <div
        class="bg-green w-full relative rounded-full"
        :style="{ height: `${progress}%` }"
      >
        <img
          src="@img/common/icon-panda.png"
          alt="icon"
          class="w-36 absolute left-0 top-0 translate-x--35% translate-y--15%"
        />
        <span
          class="text-14 text-white absolute left-0 top-0 translate-x--160% translate-y-15%"
          >{{ `${progress}%` }}</span
        >
      </div>
    </div>
    <div class="w-full bg-white rounded-full h-14" v-else>
      <div class="bg-green h-14 relative rounded-full" :style="{ width: `${curProgress}%` }">
        <img
          src="@img/common/icon-panda.png"
          alt="icon"
          class="w-48 absolute right-0 top-50% translate-y--50%"
        />
        <span
          class="text-24 text-white absolute right-0 top--250% translate-x-5% translate-y--50%"
          >{{ `${progress}%` }}</span
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.progress-wrap {
  width: 100%;
}
</style>
