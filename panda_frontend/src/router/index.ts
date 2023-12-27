import {
  createRouter,
  createWebHistory,
  RouteRecordRaw,
  RouteLocationNormalized,
  NavigationGuardNext,
} from 'vue-router';
import { useAppStore } from '@/store/appStore';
import { handleSwitchChain } from './routerHelp';
import { curNeedChain } from '@/contracts/chains';
import { getEnv } from '@/utils/buildTestnet';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/TestPage',
    name: 'testPage',
    component: () => import(/* webpackChunkName: "testPage" */ '@/views/TestPage/index.vue'),
    meta: {
      requireAccount: true, 
      needChains: curNeedChain(['vic']),
      needTips: true, 
    },
  },

  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/Home/index.vue'),
    meta: {
      requireAccount: true,
      needChains: curNeedChain(['vic']), 
      needTips: true,
    },
  },
  {
    path: '/feed',
    name: 'feed',
    component: () => import(/* webpackChunkName: "feed" */ '@/views/Feed/index.vue'),
    meta: {
      requireAccount: true,
      needChains: curNeedChain(['vic']), 
      needTips: true, 
    },
  },
  {
    path: '/mint',
    name: 'mint',
    component: () => import(/* webpackChunkName: "mint" */ '@/views/Mint/index.vue'),
    meta: {
      requireAccount: true,
      needChains: curNeedChain(['vic']), 
      needTips: true,
    },
  },
];

const env = getEnv(import.meta.env.MODE);
const router = createRouter({
  history: createWebHistory(env.routerBase),
  routes,
});

router.beforeEach(
  (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const appStore = useAppStore();
    appStore.linkWallet().then(() => {
      handleSwitchChain();
      appStore.setNetWorkReady(true);
    });

    if (to.matched.length === 0) {
      from.path ? next({ path: from.path }) : next('/'); 
    } else {
      next(); 
    }
  }
);

export default router;
