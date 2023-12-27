<script setup lang="ts">
import emitter from "@/utils/mitt";
import RecentRecord from "./Record/index";
import { bpDiv } from 'bp-math';
import useTicketNftApi from "@contApi/useTicketNft";
import { useRead, useWrite } from "@/hooks/useAction";

const mintVal = ref(1);
const hourCount = ref('0');
const useTicketNft = useTicketNftApi();

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
  }
);

const [mintFee, mintFeeEx] = useRead(
  async () => {
    return await useTicketNft.mintFee();
  },
  {
    default: '0',
    noAccount: true,
  }
);

const price = computed(()=> {
  return bpDiv(mintFee.value, 10**18)
})

const [doMint, loadDoMint] = useWrite(async () => {
  if (+mintVal.value < 1) {
    ElMessage.error('Min mint 1');
    return;
  }
  if (+mintVal.value > 5) {
    ElMessage.error('Max mint 5');
    return;
  }
  useTicketNft.mint(mintVal.value, mintFee.value);
  emitter.emit("refresh-record", true);
  mintInfoEx.refresh();
});

function add() {
  if (mintVal.value >= 5) return;
  mintVal.value += 1;
}

function sub() {
  mintVal.value -= 1;
}

// 
onMounted(() => {
  emitter.on("hour-count", (item) => {
    console.log("hour-count ...", item);
    hourCount.value = item
  });
});
// off 
onUnmounted(() => {
  emitter.off("hour-count", () => {
    hourCount.value = '0';
  });
});

const swiperOptions = reactive({
  spaceBetween: 30,
  slidesPerView: 3,
  centeredSlides: false,
  breakpoints: {
    // when window width is >= 320px
    320: {
      slidesPerView: 3,
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
    1440: {
      slidesPerView: 6,
    },
  },
});
</script>

<template>
  <div class="mint-wrap">
    <div class="content-wrap">
      <img src="@img/home/voucher.png" alt="panda" class="w-480 h-480 lg:(mr-112) thinkpad:(ml-0) notebook:(ml-51 mr-112)" />

      <div class="w-400 flex flex-col justify-start items-start sm:mt-20 pad:mt-0">
        <div class="flag">
          <div class="dot" :class="mintInfo.isEnd ? 'bg-red' : 'bg-green'"></div>
          <span class="text-15 font-500 leading-150%">{{ mintInfo.isEnd ? `Mint Finished` : `Minting Now` }}</span>
        </div>

        <span class="text-30 font-700 leading-150% capitalize mb-44">{{
          `Punk Panda`
        }}</span>

        <div class="text-15 w-400 leading-24rem">{{ `${hourCount} mints in the last hour * ${mintInfo.remain} remaining` }}</div>
        <div class="text-15 w-440 leading-24rem mb-44">
          {{
            `PunkPanda's total supply is 1000 tokens, and no more will be issued.Each address can mint up to 5 tokens.Token owners can feed PunkPanda every day and participate in DAO voting.Each token's selling price is 88 VIC.`
          }}
        </div>

        <div class="inp-wrap">
          <button class="sub" @click="sub" :disabled="mintVal <= 1">
            <img src="@img/common/icon-sub.svg" alt="sub" class="w-24" />
          </button>
          <input
            type="number"
            v-max="5"
            v-model="mintVal"
            placeholder="1"
            class="inp"
          />
          <button class="add" @click="add">
            <img src="@img/common/icon-add.svg" alt="sub" class="w-24" />
          </button>
        </div>

        <button class="mint-btn" :disabled="mintInfo.isEnd" @click="doMint">{{ `MINT` }}</button>
      </div>
    </div>

    <RecentRecord />
  </div>
</template>

<style lang="scss" scoped>
.mint-wrap {
  width: 100%;
  padding-top: 100rem;
  @include flexPos(center);
  flex-direction: column;

  .content-wrap {
    width: 100%;
    max-width: 1360rem;
    @include flexPos(flex-start);

    @media (min-width:'1280px') and (max-width: '1440px') {
      max-width: 1200rem;
    }

    @media (min-width:'1080px') and (max-width: '1280px') {
      max-width: 1000rem;
    }

    @media (min-width:'750px') and (max-width: '1080px') {
      max-width: 660rem;
      flex-direction: column;
    }

    @media (max-width: $phone) {
      max-width: 660rem;
      flex-direction: column;
    }

    .flag {
      width: 140rem;
      height: 32rem;
      margin-bottom: 27rem;
      border-radius: 79rem;
      background: #454545;
      @include flexPos(center);

      .dot {
        width: 10rem;
        height: 10rem;
        margin-right: 5rem;
        border-radius: 100%;
        // background: #75da89;
      }
    }

    .inp-wrap {
      width: 400rem;
      height: 72rem;
      padding: 12rem;
      // margin-top: 44rem;
      border-radius: 10rem;
      border: 1px solid #fff;
      @include flexPos(center);

      .inp {
        width: 280rem;
        border: none;
        font-size: 40rem;
        color: #fff;
        text-align: center;
        font-family: Inter;
        font-weight: 700;
        letter-spacing: 0.8px;
        text-transform: capitalize;
        background: transparent;

        &::placeholder {
          color: #fff;
          font-size: 40rem;
        }
      }

      .sub,
      .add {
        width: 48rem;
        height: 48rem;
        border-radius: 10rem;
        border: 1px solid #fff;
        @include flexPos(center);

        &:hover {
          background: #fcb849;
        }
        &:disabled {
          background: transparent;
        }
      }
    }

    .mint-btn {
      width: 400rem;
      height: 72rem;
      border-radius: 10rem;
      background: #fcb849;
      @include flexPos(center);
      color: #2c2d31;
      margin-top: 18rem;
      text-align: center;
      font-family: Inter;
      font-size: 24rem;
      font-weight: 700;
      letter-spacing: 0.48px;
      text-transform: capitalize;

      &:disabled {
        background: gray;
      }
    }
  }
}
</style>
