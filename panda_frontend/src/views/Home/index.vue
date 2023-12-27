<script setup lang="ts">
import Banner from './Banner/index';
import Swiper from './Swiper/index';
import Feed from './Feed/index';
import Intro from './Intro/index';
</script>

<template>
  <div class="home-wrap px-40rem">
    <Banner />

    <Swiper />
    
    <Feed />

    <Intro />
  </div>
</template>

<style lang="scss" scoped>
.home-wrap {
  width: 100%;
  @include flexPos(center);
  flex-direction: column;
}

</style>
