import { getChainData } from '@/utils/tools';
import { useAppStore } from '@store/appStore';
import { toRaw } from 'vue';
import { useRouteItem } from '@/router/useRouterTools';

/**
 * use signer
 * @returns signer
 */
export default function useDefaultRpc() {
  const appStore = useAppStore();
  const routeItem = useRouteItem();
  const { ethers, signerValue } = appStore.ethersObj;

  let signer = toRaw(signerValue);
  
  if (!appStore.defaultAccount || !appStore.rightChain) {
    const chainData = getChainData(routeItem?.meta?.needChains?.[0]);
    signer = new ethers.providers.JsonRpcProvider(chainData?.rpcUrls?.[0]);
  }
  return signer;
}
