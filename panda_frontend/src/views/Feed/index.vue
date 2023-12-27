<script setup lang="ts">
import emitter from "@/utils/mitt";
import { bpDiv, bpMul } from "bp-math";
import useTicketNftApi from "@contApi/useTicketNft";
import { useRead, useWrite } from "@/hooks/useAction";
import CountDown from "@cps/CountDown/index.vue";
import FeedProgress from "./FeedProgress/index";
import FeedRecord from "./FeedRecord/index";
import Calendar from "./Calendar/index";
import { useAppStore } from '@/store/appStore';

const appStore = useAppStore();

const feedOwners = ref("0");
const feedBalance = ref("0");

onMounted(() => {
  emitter.on("feed-total-owners", (item) => {
    console.log("airdrop-reward ...", item);
    feedOwners.value = item;
  });

  emitter.on("feed-total-balance", (item) => {
    console.log("feed-balance ...", item);
    feedBalance.value = item;
  });
});
// off 
onUnmounted(() => {
  emitter.off("feed-total-owners", () => {
    feedOwners.value = "0";
  });

  emitter.off("feed-total-balance", () => {
    feedBalance.value = "0";
  });
});

const countdownWid = computed(()=>{
  if (appStore.curDevice == 'pc') {
    return '380'
  } else {
    return '360'
  }
})
</script>

<template>
  <div class="feed-wrap">
    <div class="w-full flex-center flex-col px-40rem xl:(flex-row items-start)">
      <!-- feed -->
      <div class="w-500 flex flex-col justify-center items-center">
        <!-- count down -->
        <count-down
          :width="countdownWid"
          height="55"
          fontSize="24"
          :startTime="1702378597000"
          :endTime="1702638037000"
        />

        <FeedProgress />

        <FeedRecord />
      </div>

      <!-- calendar    -->
      <div class="calendar-container thinkpad:(flex-grow ml-40) flex-col  notebook:(max-w-1024rem ml-86) flex-center mb-20">
        <!-- title -->
        <div class="w-full flex-between mt-17">
          <div class="flex-center">
            <span class="text-24 thinkpad:text-30 font-800 uppercase mr-14">{{ `Feed record` }}</span>
            <span class="text-16 thinkpad:text-20 font-600 uppercase">
              {{ `${feedOwners} owners` }}
            </span>
          </div>

          <span class="text-18 thinkpad:text-20 text-orange font-600 uppercase">{{
            `Panda pooL: ${feedBalance} VIC`
          }}</span>
        </div>

        <Calendar />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.feed-wrap {
  width: 100%;
  padding-top: 100rem;
  @include flexPos(center);
}

.calendar-container {
  width: 60%;

  @media (max-width:'1040px') {
    width: 100%;
  }
}
</style>
