<script setup lang="ts">
import Menu from "./Menu.vue";
import WalletBtn from "@cps/WalletBtn/index.vue";
import { useTopBar } from "./useTopBar";

const { pickLang, langList, curLang } = useTopBar();

const router = useRouter();

const isOpenMenu = ref(false);
function handleMenu() {
  isOpenMenu.value = !isOpenMenu.value;
  
  document.body.style.overflow = isOpenMenu.value ? "hidden" : "auto";
}

function toHome() {
  router.push({name: 'home'});
}
</script>

<template>
  <div class="top-bar-wrap">
    <img src="@img/logo.svg" alt="logo" @click="toHome" class="w-140 h-19" />

    <div class="top-bar-tools">
      
      <WalletBtn />
    </div>

    <!-- Menu -->
    <Menu :isShowMenu="isOpenMenu" @hide="handleMenu" />
  </div>
</template>

<style lang="scss" scoped>
.top-bar-wrap {
  width: 100%;
  height: $mobTopBarHeight;
  // background-color: skyblue;
  @include flexPos(space-between);
  padding: 0 60rem;
  color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
}

.top-bar-tools {
  @include flexPos(flex-start);
  position: absolute;
  right: 89rem;

  .account-address,
  .link-btn {
    margin-left: 18rem;
  }

  .lang-container {
    cursor: pointer;
    @include flexPos(flex-start);
    color: #fff;
    font-size: 24rem;

    .icon-lang {
      width: 32rem;
      margin-right: 10rem;
    }
  }
}

.toggle-container {
  $boxHeight: 15px;
  $barHeight: 3px;

  cursor: pointer;
  height: 15px;
  @include flexPos(space-between);
  flex-direction: column;
  z-index: 9999999;
  position: absolute;

  .bar {
    transition: 0.4s;
    width: 20px;
    height: $barHeight;
    background-color: #000;
    transform-origin: center;
  }

  &.opening {
    $y: calc($boxHeight / 2 - $barHeight / 2);
    $dy: calc((-#{$boxHeight} / 2 + #{$barHeight} / 2));

    .bar:nth-child(1) {
      transform: translateY($y) rotate(45deg);
    }
    .bar:nth-child(2) {
      opacity: 0;
    }
    .bar:nth-child(3) {
      transform: translateY($dy) rotate(-45deg);
    }
  }
}
</style>
