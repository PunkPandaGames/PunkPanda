<script setup lang="ts">
import { useCountdown } from "@/hooks/useCountdown";
import useStakeContractApi from "@contApi/useStakeContractApi";
import { useRead, useWrite } from "@/hooks/useAction";

const props = withDefaults(
  defineProps<{
    width?: string;
    height?: string;
    textWid?: string;
    fontSize?: string;
    startTime?: number;
    endTime?: number;
  }>(),
  {
    width: "500",
    height: "78",
    fontSize: "30",
  }
);

const useStake = useStakeContractApi();

let inx = 0;
const [timeInfo, timeInfoEx] = useRead(
  async () => {
    const res = await useStake.getTimeInfo();
    return res;
  },
  {
    default: {
      startTime: 0,
      curEndTime: 0,
    },
    noAccount: true,
    interval: 15000,
  }
);

const width = computed(() => `${props.width}rem`);
const height = computed(() => `${props.height}rem`);
const startTime = computed(() => timeInfo.value.startTime);
const endTime = computed(() => timeInfo.value.curEndTime);

const { countdownTime, coutingStatus } = useCountdown(startTime, endTime, "D", {
  onFinished() {
    // console.log("end time");
    countdownTime.value = {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    };
    timeInfoEx.execute();
  },
});
</script>

<template>
  <div class="count-down-wrap">
    <div class="w-full flex-center">
      <div class="flex flex justify-around items-center" :class="`w-${textWid}`">
        <div
          class="text-orange font-700 leading-38rem min-w-100 max-w-120"
          :class="`text-${fontSize}`"
        >
          {{
            `${countdownTime?.hours ?? "00"}:${countdownTime?.minutes ?? "00"}:${
              countdownTime?.seconds ?? "00"
            }`
          }}
        </div>
        <span
          class="text-white font-700 leading-38rem ml-30"
          :class="`text-${fontSize}`"
          >{{ `LEFT` }}</span
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.count-down-wrap {
  width: v-bind(width);
  height: v-bind(height);
  border-radius: 42rem;
  position: relative;
  @include flexPos(center);
  border: 1px solid rgba(#fff, 0.5);
  background: linear-gradient(
    51deg,
    rgba(221, 214, 243, 0.2) 5.89%,
    rgba(250, 172, 168, 0) 93.26%
  );
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    filter: blur(22px);
  }
}
</style>
