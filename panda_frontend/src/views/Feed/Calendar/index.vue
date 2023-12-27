<script setup lang="ts">
import emitter from "@/utils/mitt";
import dayjs from "dayjs";
import feedInfo from "../feedInfo";
import toObject from "dayjs/plugin/toObject";
import { useGet } from "@/hooks/useAjax";
import useStakeContractApi from "@contApi/useStakeContractApi";
import { useRead, useWrite } from "@/hooks/useAction";
import { bpDiv, bpMul } from "bp-math";
import { useAppStore } from "@store/appStore";
import { bpThrottle } from "@/hooks/useDeb";
import { plusStar, getImage, addEvent } from "@/utils/tools";
dayjs.extend(toObject);

const appStore = useAppStore();
const useStake = useStakeContractApi();

const page = ref(0);
const offset = ref(0);
const checkedEpoch = ref(1);
const epochList = reactive(
  Array.from(Array(28).keys()).map((i) => ({
    id: i,
    Days: "0",
    Symbol: "VIC",
    FeedNumber: "0",
    FeedAmount: "0",
    isCurrent: false,
    active: false,
    locked: true,
    isFinished: false,
  }))
);
const calendar = ref(null);

/**
 * isFinished status
 */
const [isFinished, isFinishedEx] = useRead(
  async () => {
    return await useStake.isFinished();
  },
  { default: false }
);

/**
 * curEpoch
 */
const [curEpoch, curEpochEx] = useRead(
  async () => {
    const res = await useStake.curEpoch();
    page.value = +bpDiv(res, 28, { deci: 0 });
    console.log("curEpoch..", page.value);
    return res;
  },
  {
    default: 1,
    noAccount: true,
    immediate: true,
    interval: 60000,
  }
);

const initStatus = ref(true);
const infoLen = ref(0);
const monthUrl = computed(() => `http://68.178.206.124:9001/blockchain/getTotalFeedInfo`);
const params = computed(() => ({ OffsetPage: page.value }));
/**
 * month nft list
 */
const [fetchMonthList, fetchMonthListEx] = useGet(monthUrl, {
  params,
  async after(resp) {
    if (resp.code == 1) {
      // data
      infoLen.value = resp.result.DailyInfo.length;
      for (let index = 0; index < epochList.length; index++) {
        // data to epochList
        if (index < infoLen.value) {
          const item = resp.result.DailyInfo[index];
          epochList[index].Days = item.EpochNumber;
          epochList[index].FeedAmount = bpDiv(item.DailyBalance, 10 ** 18, {
            deci: -2,
          });
          epochList[index].FeedNumber = item.OwnerNumber;
          // epochList[index].active = false;
          epochList[index].isCurrent = false;
          epochList[index].locked = false;
          epochList[index].isFinished = false;
        } else {
          // others
          epochList[index].Days = "0";
          epochList[index].FeedAmount = "0";
          epochList[index].FeedNumber = "0";
          epochList[index].active = false;
          epochList[index].isCurrent = false;
          epochList[index].isFinished = false;
          epochList[index].locked = true;
        }
      }
      // last
      if (+epochList[infoLen.value - 1]?.Days == +curEpoch.value) {
        epochList[infoLen.value - 1].isCurrent = true;
        epochList[infoLen.value - 1].isFinished = isFinished.value;
        // checkedImg(epochList[infoLen.value - 1]);
      }

      // init
      if (initStatus.value) {
        epochList[infoLen.value - 1].active = true;
        epochList[infoLen.value - 1].isCurrent = true;
        checkedEpoch.value = +epochList[infoLen.value - 1].Days % 28;
        checkedImg(epochList[infoLen.value - 1]);
      }

      // feedTotalBalance owners
      const feedTotalBalance = bpDiv(resp.result?.TatalBalance, 10 ** 18, { deci: -2 });
      emitter.emit("feed-total-owners", resp.result?.TotalAddress);
      emitter.emit("feed-total-balance", feedTotalBalance);

      initStatus.value = false;
      fetchRecordListEx.refresh();
      return epochList;
    } else {
      return [];
    }
  },
  default: [],
  immediate: true,
  interval: 60000,
  watcher: [isFinished, curEpoch]
});

const rate = ref("1");
const ownerReward = ref("0");
const feedTotalBalance = ref("0");
const nftUrl = computed(() => {
  return `http://68.178.206.124:9001/blockchain/getSearchInfo?Epoch=${
    checkedEpoch.value
  }&SearchAddress=${appStore.defaultAccount ? appStore.defaultAccount : ""}`;
});
/**
 * feed record list
 */
const [fetchRecordList, fetchRecordListEx] = useGet(nftUrl, {
  params: {},
  async after(resp) {
    const list = [];
    if (resp.code == 1) {
      // ownerReward feedTotalBalance
      ownerReward.value = bpDiv(resp.result?.AirdropBalance, 10 ** 18, { deci: -2 });
      feedTotalBalance.value = bpDiv(resp.result?.TotalBalance, 10 ** 18, { deci: -2 });
      // list
      for (let i = 0, len = resp.result.FeedInfo.length; i < len; i++) {
        const item = resp.result.FeedInfo[i];
        const amount = bpDiv(item?.FeedValue, 10 ** 18, { deci: -2 });
        list.push({
          FeedAddress: plusStar(item?.FeedAddress, 6, 4),
          FeedToken: bpDiv(item?.FeedValue, 10 ** 18, { deci: -2 }),
          FeedValue: bpMul(resp.result?.ExchangeRate, amount, { deci: -2 }),
          FeedTime: dayjs(item?.FeedTime * 1000).format("DD/MM/YYYY"),
        });
      }

      emitter.emit("feed-record", list); // 
      emitter.emit("feed-owners", resp.result?.TotalAddress); // feed addr
      emitter.emit("feed-balance", feedTotalBalance.value); // feed amount
      emitter.emit("airdrop-reward", ownerReward.value); // feed num
      emitter.emit("exchange-rate", resp.result?.ExchangeRate); // rate
      feedInfo.isCurrent = epochList[checkedEpoch.value - 1].isCurrent;

      return list;
    } else {
      return [];
    }
  },
  immediate: false,
  default: [],
  wallet: true,
  watcher: [fetchMonthList]
  // interval: 60000,
});

onMounted(() => {
  fetchMonthListEx.refresh();

  addEvent(calendar.value, "mousewheel", onMouseWheel);
  addEvent(calendar.value, "DOMMouseScroll", onMouseWheel);
});

const onMouseWheel = bpThrottle((ev) => {
  var ev = ev || window.event;
  var down = true; // 
  down = ev.wheelDelta ? ev.wheelDelta < 0 : ev.detail > 0;
  if (down) {
    // 
    if (+curEpoch.value > 28 && +page.value > 0) {
      initStatus.value = true;
      page.value = +page.value - 1;
      fetchMonthListEx.refresh();
    }
    
  } else {
    const end = +bpDiv(curEpoch.value, 28, { deci: 0 });
    // 
    if (+curEpoch.value > 28 && +page.value < end) {
      initStatus.value = true;
      page.value = +page.value + 1;
      fetchMonthListEx.refresh();
    }
   
  }
  if (ev.preventDefault) {
    /*FF Chrome*/
    ev.preventDefault();
  }
  return false;
}, 1200);

/**
 * check img
 */
const checkedImg = (item) => {
  if (item.locked) return;
  checkedEpoch.value = item.Days;
  let activeItem = item;
  epochList.forEach((element) => {
    if (element.id == item.id) {
      element.active = true;
      activeItem = element;
    } else {
      element.active = false;
    }
  });
  console.log("check,,,", item, item.Days, activeItem.isCurrent);

  feedInfo.Days = activeItem.Days;
  feedInfo.FeedNumber = activeItem.FeedNumber;
  feedInfo.FeedAmount = activeItem.FeedAmount;
  feedInfo.active = activeItem.active;
  feedInfo.isFinished = activeItem.isFinished;
  feedInfo.isCurrent = activeItem.isCurrent;
  fetchRecordListEx.refresh();
};
</script>

<template>
  <div class="calendar-wrap mt-55" ref="calendar">
    <div
      class="img-container flex-center flex-col"
      v-for="item in epochList"
      :key="item.id"
    >
      <span class="text-10 font-600 mb-8 uppercase" v-if="!item.locked">
        {{ `by ${item.FeedNumber} Owner` }}
      </span>

      <div
        class="img-wrap"
        @click="checkedImg(item)"
        :class="item.active && 'border-orange!'"
      >
        <div class="mask" v-if="item.locked"></div>
        <img
          :src="
            item.isFinished ? getImage('home/death.png') : getImage('home/voucher.png')
          "
          alt="panda"
          class="w-full h-full"
        />
      </div>

      <div class="w-full flex-between mt-8" v-if="!item.locked">
        <span class="text-8 font-700 uppercase">{{ `DAY ${item.Days}` }}</span>
        <span class="text-8 font-700 uppercase">
          {{ `${item.FeedAmount} VIC` }}
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.calendar-wrap {
  width: 100%;
  overflow: auto;
  // max-height: 750rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120rem, 1fr));
  grid-gap: 15rem 30rem;
  align-items: center;

  @media (min-width: "1280px") and (max-width: "1440px") {
    grid-template-columns: repeat(auto-fit, minmax(100rem, 1fr));
    grid-gap: 8rem 15rem;
  }

  @media (min-width: "1280px") and (max-width: "1366px") {
    grid-template-columns: repeat(auto-fit, minmax(100rem, 1fr));
    grid-gap: 8rem 10rem;
  }

  @media (min-width: "1080px") and (max-width: "1280px") {
    grid-template-columns: repeat(auto-fit, minmax(100rem, 1fr));
    grid-gap: 8rem 15rem;
  }

  @media (min-width: "750px") and (max-width: "1080px") {
    grid-template-columns: repeat(auto-fit, minmax(100rem, 1fr));
    grid-gap: 8rem 15rem;
  }

  @media (max-width: "750px") {
    grid-template-columns: repeat(auto-fit, minmax(120rem, 1fr));
    grid-gap: 8rem 15rem;
  }

  .img-container {
    width: 120rem;
    height: 156rem;

    @media (min-width: "1280px") and (max-width: "1440px") {
      width: 100rem;
      height: 136rem;
    }

    @media (min-width: "1080px") and (max-width: "1280px") {
      width: 100rem;
      height: 136rem;
    }

    @media (min-width: "750px") and (max-width: "1080px") {
      width: 100rem;
      height: 136rem;
    }

    @media (max-width: "750px") {
      width: 120rem;
      height: 156rem;
    }
  }

  .img-wrap {
    width: 120rem;
    height: 120rem;
    position: relative;
    border: 4px solid #fff;

    @media (min-width: "1280px") and (max-width: "1440px") {
      width: 100rem;
      height: 100rem;
    }

    @media (min-width: "1080px") and (max-width: "1280px") {
      width: 100rem;
      height: 100rem;
    }

    @media (min-width: "750px") and (max-width: "1080px") {
      width: 100rem;
      height: 100rem;
    }

    @media (max-width: "750px") {
      width: 120rem;
      height: 120rem;
    }

    .mask {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(221, 214, 243, 0.1) 100%
      );
      backdrop-filter: blur(15px);
    }
  }
}
</style>
