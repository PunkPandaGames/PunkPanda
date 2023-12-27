<script setup lang="ts">
import { useAppStore } from "@/store/appStore";
import { plusStar } from "@/utils/tools";

const appStore = useAppStore();

const loadLink = ref(false);
/**
 * handleLink
 */
async function handleLink() {
  if (loadLink.value) return;
  loadLink.value = true;
  await appStore.linkWallet();
  loadLink.value = false;
}
</script>

<template>
  <div class="wallet-wrap text-24">
    <!-- defaultAccount -->
    <div v-if="appStore.defaultAccount" class="account-address">
      <div class="w-40 h-40 rounded-100 bg-orange flex-center mr-6">
        <img src="@img/common/icon-wallet.svg" alt="wallet" class="w-28" />
      </div>
      <span class="text-15 font-500">
        {{ plusStar(appStore.defaultAccount, 4, 4) }}
      </span>
    </div>

    <!-- connect -->
    <button v-load="loadLink" v-else class="link-btn bg-orange" @click="handleLink">
      <span class="text-15 text-#141414">{{ $t("base.1") }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.wallet-wrap {
  .account-address,
  .link-btn {
    width: 148rem;
    height: 40rem;
    // padding: 0 20rem;
    color: #fff;
    @include flexPos(center);
    font-size: 15rem;
    border-radius: 100rem;
  }
}
</style>
