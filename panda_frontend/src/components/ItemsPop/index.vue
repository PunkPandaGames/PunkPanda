<script setup lang="ts">
import Tabs from "@cps/BpTab/index.vue";
import { useGet } from "@/hooks/useAjax";
import { bpDiv, bpMul } from "bp-math";
import { useAppStore } from '@/store/appStore';
import { plusStar, getImage } from "@/utils/tools";
import dayjs from "dayjs";

const props = withDefaults(
  defineProps<{
    show: boolean; 
  }>(),
  {
    show: false,
  }
);

const emits = defineEmits<{
  (doRight: "doRight"); 
  (hide: "hide"); 
}>();

const appStore = useAppStore();
const tabsList = reactive([
  {
    id: 1,
    text: "NFT",
    active: true,
  },
  {
    id: 2,
    text: "Income",
    active: false,
  },
]);

const isNftTab = ref(true);

const doPickTab = (e) => {
  console.log("选择：", e);
  if (e.id == 1) {
    isNftTab.value = true;
  } else {
    isNftTab.value = false;
  }
};

const onClickCloseIcon = () => {
  emits("hide");
};

const nftUrl = computed(
  () =>
    `http://68.178.206.124:9001/blockchain/getPersonalNFTInfo?UserAddress=${appStore.defaultAccount}`
);
/**
 * feed record list
 */
const [fetchTokenList, fetchTokenListEx] = useGet(nftUrl, {
  params: {},
  async after(resp) {
    const list = [];
    if (resp.code == 1) {
      console.log("feed record res..", resp);
      for (let i = 0, len = resp.result.TokenInfo.length; i < len; i++) {
        const item = resp.result.TokenInfo[i];
        list.push({
          TokenID: item?.TokenID,
          MintTime: dayjs(item?.MintTime * 1000).format("DD/MM/YYYY")
        });
      }
      return list;
    } else {
      return [];
    }
  },
  immediate: true,
  default: [],
  wallet: true
});

const TotalBalance = ref("0");
const presonUrl = computed(
  () =>
    `http://68.178.206.124:9001/blockchain/getPersonalTokenInfo?UserAddress=${appStore.defaultAccount}`
);
/**
 * 获取feed record list
 */
const [fetchDropList, fetchDropListEx] = useGet(presonUrl, {
  params: {},
  async after(resp) {
    const list = [];
    if (resp.code == 1) {
      console.log("fetchDropList res..", resp);
      TotalBalance.value =  bpDiv(resp.result.TotalBalance, 10 ** 18);
      for (let i = 0, len = resp.result.CurrentInfo.length; i < len; i++) {
        const item = resp.result.CurrentInfo[i];
        list.push({
          DropTime: dayjs(item?.DropTime * 1000).format("DD/MM/YYYY"),
          DropBalance: bpDiv(item?.DropBalance, 10 ** 18, {deci: -2}),
        });
      }
      return list;
    } else {
      return [];
    }
  },
  immediate: true,
  default: [],
  wallet: true
});
</script>

<template>
  <van-popup
    v-model:show="props.show"
    closeable
    close-icon-position="top-right"
    @click-close-icon="onClickCloseIcon"
  >
    <div class="my-items-wrap">
      <!-- active tab -->
      <Tabs
        class="w-280!"
        :tabs="tabsList"
        :capsule="true"
        :eqDivi="true"
        :squarePadding="8"
        @pick-tab="doPickTab"
        squareColor="#000"
        font-size="20rem"
        color="#707070"
        activeColor="#FFF"
      />

      <div
        class="w-full flex justify-start items-start flex-col mt-38 max-h-425 overflow-auto"
        v-if="isNftTab"
      >
        <div
          class="w-full flex-between mb-13 px-8rem"
          v-for="item in fetchTokenList"
          :key="item?.TokenID"
        >
          <div class="flex-center">
            <img
              src="@img/home/panda.png"
              alt="panda"
              class="w-60 h-60 mr-13 rounded-2rem"
            />
            <span class="text-15 font-700 leading-44rem capitalize">{{
              `Punk Panda # ${item?.TokenID}`
            }}</span>
          </div>

          <span class="text-15 font-700 leading-44rem capitalize">
            {{ item?.MintTime }}
          </span>
        </div>
      </div>

      <div
        class="w-full flex justify-start items-start flex-col mt-38 h-445 overflow-auto"
        v-else
      >
        <div class="w-full flex-between mb-10 px-8rem" v-for="item in fetchDropList" :key="item?.DropTime">
          <span class="text-15 font-700 leading-44rem capitalize">{{
            `+${item?.DropBalance}`
          }}</span>

          <span class="text-15 font-700 leading-44rem capitalize">
            {{ item?.DropTime }}
          </span>
        </div>
      </div>
      <div class="w-full flex justify-end items-end" v-if="!isNftTab">
        <span class="text-15 font-700 leading-44rem capitalize">{{
          `totally：${TotalBalance}`
        }}</span>
      </div>
    </div>
  </van-popup>
</template>

<style lang="scss" scoped>
.my-items-wrap {
  width: 800rem;
  height: 640rem;
  border-radius: 8rem;
  background: #1c1d1f;
  padding: 32rem 46rem 15rem 32rem;
  @include flexPos(flex-start, flex-start);
  flex-direction: column;

  @media (max-width: $phone) {
    width: 660rem;
  }
}
</style>
