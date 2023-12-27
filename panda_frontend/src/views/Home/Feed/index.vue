<script setup lang="ts">
import emitter from "@/utils/mitt";
import ProgressBar from "@cps/Progress/index.vue";
import Tabs from "@cps/BpTab/index.vue";
import CountDown from "@cps/CountDown/index.vue";
import { useGet } from "@/hooks/useAjax";
import useStakeContractApi from "@contApi/useStakeContractApi";
import { useRead, useWrite } from "@/hooks/useAction";
import { bpDiv, bpMul } from "bp-math";
import dayjs from "dayjs";
import { plusStar } from "@/utils/tools";

const router = useRouter();

const tabsList = reactive([
  {
    id: 1,
    text: "Today",
    active: true,
  },
  {
    id: 2,
    text: "Past",
    active: false,
  },
]);

const useStake = useStakeContractApi();

const [curStakeAmount, curStakeAmountEx] = useRead(
  async () => {
    return await useStake.curStakeAmount();
  },
  { default: "0.00", noAccount: true, interval: 180000 }
);

const [curTaskAmount, curTaskAmountEx] = useRead(
  async () => {
    return await useStake.curTaskAmount();
  },
  { default: "100", noAccount: true }
);

const curProgress = computed(() => {
  const base = bpDiv(curStakeAmount.value, curTaskAmount.value, { deci: -2 });
  let res = bpMul(base, 100, { deci: -2 });

  if (+res > 100) {
    res = 100;
  }
  emitter.emit("curProgress", { type: "horizontal", val: res });
  return res;
});

const doPickTab = (e) => {
  console.log("pick", e);
};

function toFeed() {
  router.push({ name: "feed" });
}

const nftUrl = computed(
  () =>
    `http://68.178.206.124:9001/blockchain/getFeedInfo?SearchTimeStamp=${Math.floor(
      Date.now() / 1000
    )}`
);
/**
 * 获取feed record list
 */
const [fetchFeedRecordList, fetchFeedRecordListEx] = useGet(nftUrl, {
  params: {},
  async after(resp) {
    const list = [];
    if (resp.code == 1) {
      console.log("feed record res..", resp);
      for (let i = 0, len = resp.result.FeedInfo.length; i < len; i++) {
        const item = resp.result.FeedInfo[i];
        list.push({
          FeedAddress: plusStar(item?.FeedAddress, 6, 4),
          FeedToken: bpDiv(item?.FeedToken, 10 ** 18, { deci: -2 }),
          FeedValue: bpDiv(item?.FeedToken, 10 ** 18, { deci: -2 }),
          FeedValueSymbol: item?.FeedValueSymbol,
          FeedDate: dayjs(item?.FeedDate * 1000).format("DD/MM/YYYY"),
        });
      }
      return list;
    } else {
      return [];
    }
  },
  immediate: true,
  default: [],
  interval: 180000,
});
</script>

<template>
  <div class="feed-wrap px-20rem">
    <div class="text-39rem font-700 leading-50rem capitalize">{{ `feed record` }}</div>

    <div
      class="w-full flex justify-between items-start mt-10 flex-col-reverse xl:flex-row"
    >
      <div class="w-660 pad:w-440 notebook:w-952 flex flex-col justify-start items-start">
        <!-- porgress -->
        <progress-bar
          :label="true"
          :textWid="'220'"
          :progress="curProgress"
          :taskAmount="curTaskAmount"
        ></progress-bar>

        <!-- active tab -->
        <div class="active-tab">{{ `Today` }}</div>

        <!-- feed record -->
        <div class="w-660 notebook:w-803 max-h-420 overflow-auto mt-48">
          <!-- fetchFeedRecordList -->
          <div class="record-item" v-for="(item, inx) in fetchFeedRecordList" :key="inx">
            <!-- FeedAddress -->
            <span class="text-20 text-white font-500">{{ item?.FeedAddress }}</span>

            <div class="flex-between min-w-345">
              <div class="flex justify-start items-center">
                <div class="flex text-16 font-400 min-w-150 max-w-180 mr-20">
                  <span class="mr-5">{{ `Feed` }}</span>
                  <!-- item.FeedToken -->
                  <el-tooltip placement="top">
                    <template #content> {{ item?.FeedToken }} </template>
                    <div class="max-w-70 truncate-text">{{ item?.FeedToken }}</div>
                  </el-tooltip>
                  <span class="ml-5">{{ `VIC` }}</span>
                </div>

                <!-- <el-tooltip placement="top">
                  <template #content> {{ item?.FeedValue }} </template>
                  <div class="max-w-60 text-16 text-[#818698] truncate-text">
                    {{ `≈$${item?.FeedValue}` }}
                  </div>
                </el-tooltip> -->
              </div>
              <!-- item?.FeedDate -->
              <span class="text-16">{{ item?.FeedDate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- feed panda -->

      <div class="flex-center flex-col">
        <count-down :startTime="1702378597000" :endTime="1702638037000" />

        <div class="img-wrap" @click="toFeed">
          <img src="@img/home/voucher.png" alt="panda" class="w-full h-full" />
          <div class="feed-btn" @click="toFeed">{{ `FEED NOW!` }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.feed-wrap {
  width: 100%;
  max-width: 1556rem;
  margin-top: 80rem;
  @media (max-width: $phone) {
    max-width: 660rem;
  }

  .truncate-text {
    overflow: hidden;
    -o-text-overflow: ellipsis;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .active-tab {
    width: 130rem;
    height: 54rem;
    border-radius: 10rem;
    background: #2c2d31;
    color: #fff;
    font-family: Inter;
    font-size: 20rem;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    margin-top: 66rem;
    letter-spacing: 0.8px;
    @include flexPos(center);
    text-transform: capitalize;
  }

  .record-item {
    width: 100%;
    height: 55rem;
    margin-bottom: 18rem;
    padding: 0 30rem 0 27rem;
    @include flexPos(space-between, center);
    border-radius: 30rem;
    background-color: #2c2d31;
  }

  .countdown-btn {
    width: 500rem;
    height: 78rem;
    border-radius: 42rem;
    position: relative;
    @include flexPos(center);
    border: 1px solid #fff;
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

  .img-wrap {
    width: 500rem;
    height: 500rem;
    border-radius: 4rem;
    overflow: hidden;
    margin-top: 24rem;
    position: relative;
    @media (max-width: $phone) {
      margin-bottom: 20rem;
    }
    &:hover {
      .feed-btn {
        opacity: 1;
      }
    }
    .feed-btn {
      position: absolute;
      left: 0;
      bottom: 0;
      opacity: 0;
      color: #2c2d31;
      width: 100%;
      height: 69rem;
      font-weight: 700;
      font-size: 20rem;
      letter-spacing: 0.4px;
      background: #fcb849;
      @include flexPos(center);
      text-transform: uppercase;
      transition: opacity 0.8s linear;
    }
  }
}
</style>
