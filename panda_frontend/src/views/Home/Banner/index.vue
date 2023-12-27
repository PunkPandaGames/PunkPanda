<script setup lang="ts">
import { bpDiv, bpMul } from "bp-math";
import useTicketNftApi from "@contApi/useTicketNft";
import { useRead, useWrite } from "@/hooks/useAction";

const router = useRouter();

const data = reactive([
  { id: 1, name: "Owners", value: "0", suffix: "" },
  { id: 2, name: "Panda Pool", value: "0", suffix: " VIC" },
  { id: 3, name: "Survival Days", value: "0", suffix: "" },
]);

const useTicketNft = useTicketNftApi();

const [totalInfo, totalInfoEx] = useRead(
  async () => {
    const res = await useTicketNft.totalInfos();
    data[0].value = res.totalOwners;
    data[1].value = res.totalAmount;
    data[2].value = res.curEpoch;

    if (+res.totalOwners > 1000000) {
      data[0].value = bpDiv(res.totalOwners, 1000000, { deci: -2 }) + "M";
    }

    if (+res.totalAmount > 1000000) {
      data[1].value = bpDiv(res.totalAmount, 1000000, { deci: -2 }) + "M";
    }
  },
  {
    default: {
      totalAmount: 0,
      totalOwners: 0,
      curEpoch: 1,
    },
    noAccount: true,
    interval: 60000,
  }
);

function toMint() {
  router.push({ name: "mint" });
}
</script>

<template>
  <div class="banner-wrap">
    <div class="background"></div>
    <img src="@img/home/solgan.png" alt="" class="solgon" />

    <p class="w-600 text-21 mt-39 lg:(w-973 ml-172) opacity-80">
      {{
        `The First Gaming-defi application. Easy to play, Easy to earn.`
      }}
    </p>

    <div
      class="w-600 lg:(w-800 ml-172 flex-row justify-between items-center) mt-80 flex flex-col justify-start items-center"
    >
      <div class="w-512 flex justify-start items-center">
        <div class="w-156 flex-center flex-col mr-22" v-for="item in data" :key="item.id">
          <div class="text-orange text-30 font-700 mb-14 w-156 text-center truncate-text">
            {{ `${item.value}${item.suffix}` }}
          </div>
          <span class="text-16 text-gray capitalize">{{ item.name }}</span>
        </div>
      </div>

      <button class="mint-btn" @click="toMint">{{ `Mint Now` }}</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.banner-wrap {
  width: 100%;
  position: relative;
  max-width: 1556rem;
  height: 1024rem;

  @media (max-width: $phone) {
    max-width: 90%;
    flex-direction: column;
  }

  .truncate-text {
    overflow: hidden;
    -o-text-overflow: ellipsis;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    max-width: 1430rem;


    background-image: url("@img/home/banner.png");
    background-size: 100%;
    background-repeat: no-repeat;
  }
}

.solgon {
  width: 903rem;
  height: 240rem;
  margin-top: 320rem;
  margin-left: 124rem;
  background-image: url("@img/home/solgan.png");
  background-size: 100%;
  background-repeat: no-repeat;

  @media (max-width: $phone) {
    width: 600rem;
    margin-left: 4rem;
    margin-top: 280rem;
    background-size: 100% 100%;
  }
}

.title-wrap {
  position: relative;
  @include flexPos(flex-start, flex-start);
  flex-direction: column;
  margin-top: 340rem;
  @media (max-width: $phone) {
    margin-top: 140rem;
  }
  .title {
    color: #fff;
    position: relative;
    font-family: Roboto;
    font-size: 75rem;
    font-weight: 900;
    letter-spacing: 3px;
    text-transform: uppercase;
  }
  .block-left {
    position: absolute;
    left: -6%;
    top: -5%;
    width: 83rem;
    height: 115rem;
    background-image: url("@img/common/bg-block.png");
    background-size: 100%;
    background-repeat: no-repeat;
  }
  .block-right {
    position: absolute;
    right: -3%;
    bottom: -5%;
    width: 83rem;
    height: 115rem;
    transform: rotate(-180deg);
    background-image: url("@img/common/bg-block.png");
    background-size: 100%;
    background-repeat: no-repeat;
  }
}

.mint-btn {
  width: 204rem;
  height: 61.2rem;
  color: #2c2d31;
  font-size: 20rem;
  font-weight: 700;
  background-color: #fcb849;
  border-radius: 4rem;
  z-index: 99;
  letter-spacing: 0.4px;
  @include flexPos(center);
  @media (max-width: $phone) {
    margin-top: 50rem;
  }
}
</style>
