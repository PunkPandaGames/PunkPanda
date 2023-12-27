<script setup lang="ts">
import ItemsPop from "@cps/ItemsPop/index.vue";
import { useAppStore } from "@store/appStore";
import { useGet } from "@/hooks/useAjax";
import {plusStar, getImage } from "@/utils/tools";
import { useRead } from "@/hooks/useAction";
import { bpDiv, bpMul } from "bp-math";
import dayjs from "dayjs";
import useTicketNftApi from "@contApi/useTicketNft";

const isShowPop = ref(false);
const appStore = useAppStore();
const useTicketNft = useTicketNftApi();

function openPop() {
  if (appStore.defaultAccount) {
    isShowPop.value = true;
  } else {
    ElMessage.error("Please link wallet first");
  }
}

const [mintInfo, mintInfoEx] = useRead(
  async () => {
    return await useTicketNft.mintInfo();
  },
  {
    default: {
      totalMint: 0,
      remain: "1000",
      isEnd: false
    },
    noAccount: true,
    interval: 60000
  }
);

const nftNum = ref('0');
const nftUrl = computed(() => `http://68.178.206.124:9001/blockchain/getMintInfo`);
/**
 * owner nft list
 */
const [fetchNFTList, fetchNFTListEx] = useGet(nftUrl, {
  params: {},
  async after(resp) {
    const list = [];
    if (resp.code == 1) {
      console.log("nft res..", resp);
      for (let i = 0, len = resp.result.CurrentInfo.length; i < len; i++) {
        const item = resp.result.CurrentInfo[i];
        list.push({
          TokenId: item.TokenId,
          OwnerAddress: plusStar(item.OwnerAddress, 4, 4),
          TokenMintValue: bpDiv(item.TokenMintValue, 10 ** 18, {deci: -2}),
          TokenMintSymbol: item.TokenMintSymbol,
          MintDate: dayjs(item.MintDate).format("DD/MM/YYYY"),
        });
      }
      nftNum.value = list.length;
      if (list.length < 7) {
        const arrLen = 7 - list.length;
        for (let i = 0, len = arrLen; i < len; i++) {
          list.push({});
        }
      }
      return list;
    } else {
      // return [{ TokenId: 1 }, { TokenId: 2 }, { TokenId: 3 }, { TokenId: 4 }, {}, {}, {}];
      return [{}, {}, {}, {}, {}, {}];
    }
  },
  immediate: true,
  default: [{}, {}, {}, {}, {}, {}, {}],
  interval: 60000
});

const swiperOptions = reactive({
  loop:false,
  autoplay: false,
  spaceBetween: 30,
  slidesPerView: 2,
  centeredSlides: false,
  navigation: {
    prevEl: ".slide-prev", 
    nextEl: ".slide-next", 
    hideOnClick: true
  },
  breakpoints: {
    // when window width is >= 320px
    320: {
      slidesPerView: 2,
    },
    // when window width is >= 480px
    480: {
      slidesPerView: 3,
    },
    // when window width is >= 640px
    640: {
      slidesPerView: 3,
    },
    1040: {
      slidesPerView: 4,
    },
    1280: {
      slidesPerView: 5,
    },
    1560: {
      slidesPerView: 6,
    },
  },
});

const isShow = computed(()=> {
  if (nftNum.value < 6) {
    return false;
  } else {
    return true;
  }
})
</script>

<template>
  <div class="swiper-wrap">
    <div class="w-full flex-between">
      <div class="flex-center">
        <div class="text-28 font-700 uppercase mr-21">{{ `NFT launch pad` }}</div>
        <span class="text-20 font-700">{{ `${mintInfo.totalMint}/1000` }}</span>
      </div>
      <span
        class="text-20 text-orange leading-24rem font-700 underline underline-offset-4 underline-1 underline-orange uppercase"
        @click="openPop"
        >{{ `my items` }}</span
      >
    </div>

    <div class="w-full mt-30 relative">
      <bp-swiper :option="swiperOptions">
        <swiper-slide v-for="(nft, inx) in fetchNFTList" :key="inx">
          <div class="item-container">
            <img
              src="@img/common/icon-lock.svg"
              alt="lock"
              class="w-30 absolute top-35% left-42%"
              v-if="!nft?.TokenId"
            />
            <img
              :src="
                nft?.TokenId ? getImage('home/voucher.png') : getImage('home/bg-mask.png')
              "
              alt="img"
              class="image"
            />
            <span class="text-15 text-white font-400 mt-25">{{
              nft?.TokenId ? `Punk Panda #${nft?.TokenId}` : "Cooming Soon"
            }}</span>
            <span class="text-15" v-show="nft?.TokenId">{{
              `Minted by ${nft?.OwnerAddress}`
            }}</span>
            <span class="text-15 uppercase" v-show="nft?.TokenId">{{
              `${nft.TokenMintValue} ${nft.TokenMintSymbol}`
            }}</span>
          </div>
        </swiper-slide>
      </bp-swiper>
      <button class="slide-prev"></button>
      <button class="slide-next"></button>
    </div>

    <ItemsPop :show="isShowPop" @hide="isShowPop = false" />
  </div>
</template>

<style lang="scss" scoped>
.swiper-wrap {
  width: 100%;
  margin-top: 68rem;
  max-width: 1584rem;
  @media (max-width: $phone) {
    max-width: 660rem;
  }
}

:deep(.swiper-button-disabled) {
  display: none
}

.item-container {
  width: 239rem;
  height: 320rem;
  @media (max-width: $phone) {
    width: 300rem;
  }
  padding: 24rem;
  position: relative;
  @include flexPos(flex-start, center);
  flex-direction: column;
  border-radius: 10rem;
  z-index: 99;
  overflow: hidden;
  border: 1px solid rgba(#fff, 0.5);
  background: linear-gradient(
    49deg,
    rgba(221, 214, 243, 0.2) 5.95%,
    rgba(250, 172, 168, 0) 102.94%
  );
  &::before {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    -webkit-filter: blur(22px);
    filter: blur(22px);
  }
  .image {
    width: 200rem;
    height: 200rem;
    border-radius: 4rem;
    background: linear-gradient(
      0deg,
      rgba(250, 252, 254, 0.2) 0%,
      rgba(250, 252, 254, 0.2) 100%
    );
  }
}

.slide-prev {
  width: 70rem;
  height: 70rem;
  position: absolute;
  left: 0;
  top: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);
  background-image: url("@img/common/icon-prev.png");
  background-size: 100%;
  background-repeat: no-repeat;
}
.slide-next {
  width: 70rem;
  height: 70rem;
  position: absolute;
  right: 0%;
  top: 50%;
  z-index: 10;
  transform: translate(50%, -50%) rotate(180deg);
  background-image: url("@img/common/icon-prev.png");
  background-size: 100%;
  background-repeat: no-repeat;
}
</style>
