<script setup lang="ts">
import { Swiper, useSwiper } from 'swiper/vue';
import { Autoplay, Pagination, Navigation } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';


const modules = [Autoplay, Pagination, Navigation];

const props = defineProps<{
  option; 
}>();

const swiperOptions: any = computed(() => {
  return {
    autoplay: {
      delay: 3000, // delay
      disableOnInteraction: false,
      pauseOnMouseEnter: false, 
      reverseDirection: false,
    },
    loop: true,
    speed: 500, //speed
    mousewheel: true, // mousewheel
    slidesPerView: 'auto', //slidesPerView 
    centeredSlides: true,
    spaceBetween: 20, 
    coverflowEffect: {
      rotate: 0, 
      stretch: -10, 
      depth: 100,
      modifier: 1, 
      slideShadows: false, 
    },
    observer: true,
    observeParents: true,
    observeSlideChildren: true,
    a11y: {
      prevSlideMessage: 'Previous slide',
      nextSlideMessage: 'Next slide',
    },
    initialSlide: 0,

    ...props.option,
  };
});

/**
 * to page
 */
function handleSlide(page: number) {
  swiperObj.value.slideTo(page);
}

const swiperObj = ref(null);
defineExpose({
  handleSlide,
});
</script>

<template>
  <swiper
    :modules="modules"
    :loop="swiperOptions.loop"
    :autoplay="swiperOptions.autoplay"
    @swiper="(Swiper) => (swiperObj = Swiper)"
    :navigation="swiperOptions.navigation"
    :speed="swiperOptions.speed"
    :spaceBetween="swiperOptions.spaceBetween"
    :coverflowEffect="swiperOptions.coverflowEffect"
    :centeredSlides="swiperOptions.centeredSlides"
    :slidesPerView="swiperOptions.slidesPerView"
    :mousewheel="swiperOptions.mousewheel"
    :observer="swiperOptions.observer"
    :observeParents="swiperOptions.observeParents"
    :observeSlideChildren="swiperOptions.observeSlideChildren"
    :centerInsufficientSlides="swiperOptions.centerInsufficientSlides"
    :pagination="swiperOptions.pagination"
    :initialSlide="swiperOptions.initialSlide"
    :breakpoints="swiperOptions.breakpoints"
  >
    <slot></slot>
  </swiper>
</template>

<style lang="scss" scoped></style>