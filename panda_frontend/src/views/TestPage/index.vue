<script setup lang="ts">
import { STAKE_CONT } from '@/contracts/address';
import { useRead, useWrite } from "@/hooks/useAction";
import useCoinToken from "@contApi/useCoinToken";
import { useAppStore } from "@store/appStore";

const appStore = useAppStore();

const swiperOptions = reactive({
  // spaceBetween: 30,
  slidesPerView: 3,
});

const b = ref(0);
const a = computed(() => b.value);

function add() {
  if (a.value != "x") {
    console.log("yes");
  } else {
    console.log("no");
  }
  watch(a, (val) => {
    console.log("change。。", a.value);
  });
}

// const [balance, balanceEx] = useRead(
//   async () => {
//     const { ethers, signerValue } = appStore.ethersObj;
//     const signer = toRaw(signerValue);
//     return signer.provider.getBalance(appStore.defaultAccount).then((value) => {
//       console.log(">>> native token balance: ", ethers.utils.formatUnits(value.toString(), 18));
//       return ethers.utils.formatUnits(value.toString(), 18);
//     });
//   },
//   { default: '' }
// );
</script>

<template>
  <div class="test-wrap">
  

    <!-- <div class="w-500 pt-130 relative">
      {{ `balance：${balance}` }}
    </div> -->
  </div>
</template>

<style lang="scss" scoped>
.test-wrap {
  height: 100vh;

  .item-container {
    width: 160rem;
    height: 160rem;
  }
}
</style>
