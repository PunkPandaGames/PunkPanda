<script setup lang="ts">
import emitter from "@/utils/mitt";
import feedInfo from "../feedInfo";
import dayjs from "dayjs";
import { useGet } from "@/hooks/useAjax";
import ProgressBar from "@cps/Progress/index.vue";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import useStakeContractApi from "@contApi/useStakeContractApi";
import { useRead, useWrite } from "@/hooks/useAction";
import { bpDiv, bpMul } from "bp-math";
import { plusStar, getImage, addEvent } from "@/utils/tools";
dayjs.extend(isSameOrBefore);

const useStake = useStakeContractApi();

const isToday = computed(() => {
  console.log('当前状态。。',feedInfo.isCurrent && !feedInfo.isFinished,feedInfo.isCurrent, !feedInfo.isFinished);
  
  return feedInfo.isCurrent && !feedInfo.isFinished;
});

const reward = ref("0");

const isShowPop = ref(false);
const feedNum = ref("1");
const progress = ref(0);
/**
 * feed val $
 */
const feedValues = computed(() => {
  return feedNum.value * fetchExchangeRate.value;
});

const rateUrl = computed(() => `http://68.178.206.124:9001/blockchain/getExchangeRate`);
/**
 * fetchExchangeRate
 */
const [fetchExchangeRate, fetchExchangeRateEx] = useGet(rateUrl, {
  params: {},
  async after(resp) {
    const list = [];
    if (resp.code == 1) {
      return resp.result?.ExchangeRate;
    } else {
      return "1";
    }
  },
  immediate: true,
  default: "1",
});

// task
const [curTaskAmount, curTaskAmountEx] = useRead(
  async () => {
    return await useStake.curTaskAmount();
  },
  { default: "0.00" }
);
// curProgress
const curProgress = computed(() => {
  const base = bpDiv(feedInfo.FeedAmount, curTaskAmount.value, { deci: -2 });
  let res = bpMul(base, 100, { deci: -2 });
  if (+res > 100) {
    res = 100;
  }
  emitter.emit("curProgress", { type: "vertical", val: res });
  return res;
});

/**
 * feed
 */
const [doFeed, loadDoFeed] = useWrite(async () => {
  if (+feedNum.value < 0.01) {
    ElMessage.error("The minimum feeding amount is 0.01");
    return;
  }

  isShowPop.value = false;
  useStake.stake(feedNum.value);
  isShowPop.value = false;
});

//  check-item
onMounted(() => {

  emitter.on("feed-owners", (item:string) => {
    console.log("feedInfo.FeedNumber ...", item);
    feedInfo.FeedNumber = item;
  });

  emitter.on("feed-balance", (item:string) => {
    console.log("feedInfo.FeedAmount ...", item);
    feedInfo.FeedAmount = item;
  });

  emitter.on("airdrop-reward", (item:string) => {
    console.log("airdrop-reward ...", item);
    reward.value = item;
  });
});
// off 
onUnmounted(() => {


  emitter.off("airdrop-reward", () => {
    reward.value = "0";
  });
});

</script>

<template>
  <div class="feed-progress-wrap">
    <div class="w-360 notebook:w-380 flex-between mb-18">
      <span class="text-20 font-700 uppercase">{{
        `by ${feedInfo.FeedNumber} Owner`
      }}</span>
      <span class="text-20 font-700 uppercase">{{ `DAY ${feedInfo.Days}` }}</span>
    </div>

    <div class="w-full relative flex justify-start items-start">
      <!-- porgress -->
      <progress-bar
        class="absolute top-0 left--36rem"
        :vertical="true"
        :label="false"
        :textWid="'200'"
        :progress="curProgress"
        :taskAmount="curTaskAmount"
      ></progress-bar>

      <img
        :src="feedInfo.isFinished ? getImage('home/death.png') : getImage('home/voucher.png')"
        alt="panda"
        class="w-360 notebook:w-380 rounded-4rem"
      />
    </div>

    <button class="feed-btn" @click="isShowPop = true" v-if="isToday">
      {{ `Feed Now` }}
    </button>
    <div class="reward" v-else>{{ `you got ${reward} PD` }}</div>

    <van-popup v-model:show="isShowPop">
      <div class="feed-pop-wrap">
        <div class="w-full flex-between">
          <span class="text-16 font-700 capitalize">{{ `Please enter price` }}</span>

          <img
            src="@img/common/icon-close.svg"
            alt="close"
            class="w-20"
            @click="isShowPop = false"
          />
        </div>

        <div class="inp-wrap">
          <input type="number" v-model="feedNum" class="inp" />
          <div class="w-full flex justify-end items-end mt-9 text-16 text-[#818698]">
            {{ `≈$${feedValues}` }}
          </div>
        </div>

        <button class="feed" @click="doFeed" v-load="loadDoFeed">{{ `Feed` }}</button>
      </div>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.feed-progress-wrap {
  width: 100%;
  max-width: 360rem;
  margin-top: 34rem;
  @include flexPos(flex-end, flex-end);
  flex-direction: column;

  @media (min-width: "1560px") {
    max-width: 380rem;
  }

  .feed-btn {
    width: 360rem;
    height: 48rem;
    border-radius: 4rem;
    background: #fcb849;
    color: #2c2d31;
    margin-top: 16rem;
    margin-bottom: 16rem;
    @include flexPos(center);
    text-align: center;
    font-family: Inter;
    font-size: 18rem;
    font-weight: 700;
    letter-spacing: 0.36px;
    text-transform: capitalize;

    @media (min-width: "1560px") {
      width: 380rem;
    }
  }

  .reward {
    width: 380rem;
    height: 48rem;
    border-radius: 4rem;
    background: #2c2d31;
    color: #fff;
    margin-top: 18rem;
    margin-bottom: 30rem;
    @include flexPos(center);
    text-align: center;
    font-family: Inter;
    font-size: 18rem;
    font-weight: 700;
    letter-spacing: 0.36px;
    text-transform: capitalize;
  }

  .feed-pop-wrap {
    width: 560rem;
    height: 400rem;
    padding: 20rem;
    border-radius: 8px;
    background: #1c1d1f;
    @include flexPos(flex-start, center);
    flex-direction: column;

    .inp-wrap {
      width: 400rem;
      margin-top: 79rem;
      @include flexPos(center);
      flex-direction: column;

      .inp {
        width: 100%;
        height: 72rem;
        font-size: 30rem;
        @include flexPos(center);
        background: transparent;
        border-radius: 10rem;
        border: 1px solid #fff;
        color: #fff;
        text-align: center;
        font-family: Inter;
        font-weight: 700;
        letter-spacing: 0.6px;
        text-transform: capitalize;

        &::placeholder {
          color: #fff;
        }
      }
    }

    .feed {
      width: 400rem;
      height: 72rem;
      background: #fcb849;
      border-radius: 10rem;
      color: #2c2d31;
      margin-top: 50rem;
      text-align: center;
      font-family: Inter;
      font-size: 24rem;
      font-weight: 700;
      letter-spacing: 0.48px;
      text-transform: capitalize;
    }
  }
}
</style>
