<script setup lang="ts">
import emitter from "@/utils/mitt";
import { useGet } from "@/hooks/useAjax";
import { bpDiv, bpMul } from "bp-math";
import dayjs from "dayjs";
import { plusStar, getImage } from "@/utils/tools";

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
      // hour count provider
      emitter.emit("hour-count", resp.result?.HourCount);

      for (let i = 0, len = resp.result.CurrentInfo.length; i < len; i++) {
        const item = resp.result.CurrentInfo[i];
        list.push({
          TokenId: item.TokenId,
          OwnerAddress: plusStar(item.OwnerAddress, 4, 4),
          TokenMintValue: bpDiv(item.TokenMintValue, 10 ** 18, { deci: -2 }),
          TokenMintSymbol: item.TokenMintSymbol,
          MintDate: dayjs(item.MintDate).format("DD/MM/YYYY"),
        });
      }
      if (list.length < 7) {
        const arrLen = 7 - list.length;
        for (let i = 0, len = arrLen; i < len; i++) {
          list.push({});
        }
      }
      return list;
    } else {
      // return [{ TokenId: 1 }, { TokenId: 2 }, { TokenId: 3 }, { TokenId: 4 }, {}, {}, {}];
      return [{}, {}, {}, {}, {}, {}, {}];
    }
  },
  immediate: true,
  default: [{}, {}, {}, {}, {}, {}, {}],
  interval: 60000,
});

const swiperOptions = reactive({
  spaceBetween: 40,
  slidesPerView: 2,
  autoplay: false,
  centeredSlides: false,
  navigation: {
    prevEl: ".slide-prev", 
    nextEl: ".slide-next", 
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
      slidesPerView: 5,
    },
    1280: {
      slidesPerView: 6,
      spaceBetween: 20,
    },
    1440: {
      slidesPerView: 7,
      spaceBetween: 20,
    },
    1560: {
      slidesPerView: 7,
    },
  },
});

// 
onMounted(() => {
  emitter.on("refresh-record", (item) => {
    console.log("refresh-record ...", item);
    fetchNFTListEx.refresh();
  });
});
// off 
onUnmounted(() => {
  emitter.off("refresh-record", () => {
  });
});
</script>

<template>
  <div class="record-wrap">
    <div class="text-24 font-600 mb-15 capitalize">{{ `recent mints` }}</div>

    <div class="w-full flex justify-start items-start">
      <bp-swiper :option="swiperOptions">
        <swiper-slide v-for="(item, inx) in fetchNFTList" :key="inx">
          <div class="flex flex-col justify-center items-center">
            <img
              :src="
                item?.TokenId
                  ? getImage('home/voucher.png')
                  : getImage('home/bg-mask.png')
              "
              alt="holder"
              class="w-160 h-160 rounded-4rem"
            />
            <p class="text-14 mt-23">
              {{ item?.TokenId ? `Punk Panda #${item?.TokenId}` : "Comming Soon" }}
            </p>
            <p class="text-14" v-show="item?.TokenId">
              {{ `Minted by ${item?.OwnerAddress}` }}
            </p>
            <p class="text-14 uppercase" v-show="item?.TokenId">
              {{ `${item.TokenMintValue} ${item.TokenMintSymbol}` }}
            </p>
          </div>
        </swiper-slide>
      </bp-swiper>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.record-wrap {
  width: 100%;
  max-width: 1360rem;
  margin-top: 50rem;
  //margin-bottom: 104rem;
  @include flexPos(flex-start, flex-start);
  flex-direction: column;

  @media (min-width: "1280px") and (max-width: "1440px") {
    max-width: 1200rem;
  }

  @media (min-width: "1080px") and (max-width: "1280px") {
    max-width: 1000rem;
  }

  @media (min-width: "750px") and (max-width: "1080px") {
    max-width: 660rem;
  }
}
</style>
