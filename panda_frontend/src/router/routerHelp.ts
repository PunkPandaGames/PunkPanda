import { useAppStore } from '../store/appStore';
import i18n from '@/locales/i18n';
import { useRouteItem } from './useRouterTools';
const $t = i18n.global.t;
import { nextTick } from 'vue';


export function checkRightChain(to?, from?) {
  const curRouteItem = useRouteItem();
  const targetRoute = to || curRouteItem;

  const appStore = useAppStore();
  const { chainId } = appStore.ethersObj;
  const inclu = targetRoute.meta?.needChains?.includes(chainId);
  if (!inclu && targetRoute.meta?.needChains !== undefined) {
    appStore.setRightChain(false);
    return false;
  } else {
    appStore.setRightChain(true);
    return true;
  }
}


export function handleSwitchChain() {
  const rightChain = checkRightChain();
  const appStore = useAppStore();
  const curRouteItem = useRouteItem();


  if (!rightChain) {
    nextTick(() => {
      appStore.switchChain(curRouteItem.meta?.needChains[0]);
    });
  }
}
