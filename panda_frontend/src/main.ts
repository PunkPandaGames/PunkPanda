// dev
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import VueI18n from '@/locales/i18n';
import 'animate.css';
import mitt from 'mitt';
import bpDirective from './utils/bpDirective';
import watchUrl from './router/watchUrl';

// init
import '@/utils/initRem';
import '@css/index.scss';
import 'virtual:uno.css';

import BpButton from '@cps/BpButton';
import BpSwiper from '@cps/BpSwiper';
import { useAppStore } from './store/appStore';
import { bpThrottle } from './hooks/useDeb';

const pinia = createPinia();
const emitter = mitt();

const vueApp = createApp(App);

vueApp.config.globalProperties.$p = (param): string => param;
vueApp.config.globalProperties.emitter = emitter;

vueApp.use(router).use(VueI18n).use(pinia).use(BpButton).use(BpSwiper).use(bpDirective).mount('#app');

const appStore = useAppStore();
appStore.getCurDevice();
window.onresize = bpThrottle(() => {
  appStore.getCurDevice();
});

watchUrl();
