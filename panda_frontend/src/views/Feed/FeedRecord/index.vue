<script setup lang="ts">
import emitter from "@/utils/mitt";
import { useGet } from "@/hooks/useAjax";

const feedBalance = ref("0");
const feedRecordList = ref([]);

// 
onMounted(() => {
  emitter.on("feed-record", (list) => {
    console.log("feed-record ...", list);
    feedRecordList.value = list;
  });

  emitter.on("feed-balance", (item) => {
    console.log("feed-balance ...", item);
    feedBalance.value = item;
  });
});
// off 
onUnmounted(() => {
  emitter.off("feed-record", () => {
    feedRecordList.value = [];
  });
  emitter.off("feed-balance", () => {
    feedBalance.value = "0";
  });
});
</script>

<template>
  <div class="feed-record-wrap">
    <div class="text-18 text-white font-700 mt-14 uppercase">
      {{ `Total ${feedBalance} VIC` }}
    </div>

    <ul class="w-full mt-10 max-h-140 overflow-auto">
      <li class="w-full flex-between mb-10" v-for="(item, inx) in feedRecordList" :key="inx">
        <span class="text-16">{{ item.FeedAddress }}</span>

        <div class="flex flex-col justify-start items-start min-w-120 max-w-156">
          <div class="w-110 flex justify-start items-start text-16 font-400 mr-20">
            <span class="mr-5">{{ `Feed` }}</span>
            <!-- item.FeedToken -->
            <el-tooltip placement="top">
              <template #content> {{ item?.FeedToken }} </template>
              <div class="max-w-80 truncate-text">{{ item?.FeedToken }}</div>
            </el-tooltip>
            <span class="ml-5">{{ `VIC` }}</span>
          </div>


          <el-tooltip placement="top">
            <template #content> {{ item?.FeedValue }} </template>
            <div class="max-w-156 text-16 text-[#818698] truncate-text">
              {{ `$${item?.FeedValue}` }}
            </div>
          </el-tooltip>
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.feed-record-wrap {
  width: 429rem;
  overflow: auto;
  // max-height: 200rem;
  border-top: 2px solid rgba(#fff, 0.5);
  @include flexPos(flex-start, flex-start);
  flex-direction: column;
}

.truncate-text {
  overflow: hidden;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
