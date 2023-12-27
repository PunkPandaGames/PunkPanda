import { ethers } from 'ethers';
import { useAppStore } from '@/store/appStore';
import i18n from '@/locales/i18n';
import { bpFormat, bpGt, bpMul } from 'bp-math';
import { bpRead, bpWrite } from '@/service/bpAction';
import useDefaultRpc from './useDefaultRpc';
import { reactive, Ref, ref } from 'vue';
import { watchAccount } from '@/hooks/useAction';
import axios from '@/service/request';

const $t = i18n.global.t;

export default (addressObj: IAddressObj) => {
  const appStore = useAppStore();
  const created = ref<boolean>(false); 
  const nftObj = ref<any>({}); 


  function createContract(addressObj: IAddressObj) {
    const signer = useDefaultRpc();
    try {
      nftObj.value = new ethers.Contract(addressObj.address, addressObj.abi, signer);
    } catch (error) {
      console.log('构建nft合约对象失败...');
    }
    created.value = true;
    return nftObj;
  }
  createContract(addressObj);

  watchAccount(() => {
    createContract(addressObj);
  });

  const balanceObj = reactive({
    origin: '0',
    show: '0',
  });

  async function getBalance(digi: number = 2, addr?: string) {
    const targetAddr = addr ?? appStore.defaultAccount;
    const { status, datas } = (await bpRead(nftObj.value.balanceOf, targetAddr)) || {};
    if (!status) console.log('getBalance...error...');

    balanceObj.origin = status ? datas : '0';
    balanceObj.show = status ? String(datas) : '0';

    return balanceObj;
  }


  const hasAllowForAll = ref<boolean>(false);

  async function isApprovedForAll(addr: string): Promise<boolean> {
    const { status, datas } = await bpRead(
      nftObj.value.isApprovedForAll,
      appStore.defaultAccount,
      addr
    );
    if (!status) console.log('isApprovedForAll...error...');
    hasAllowForAll.value = status ? datas : false;
    return hasAllowForAll.value;
  }

  async function setApprovalForAll(addr: string) {
    const { status } = await bpWrite(
      { success: $t('base.5') },
      nftObj.value.setApprovalForAll,
      addr,
      true
    );
    return status;
  }


  async function transferFrom(to: string, tokenId) {
    const { status } = await bpWrite(
      { success: $t('base.6') },
      nftObj.value.transferFrom,
      appStore.defaultAccount,
      to,
      tokenId
    );
    return status;
  }

  async function tokenURI(ids: number[]) {
    const resp = ids.map(async (id) => {
      const { datas } = await bpRead(nftObj.value.tokenURI, id);
      return datas;
    });

    const res = await Promise.all(resp);

    const metaData = res.map(async (url) => {
      const resp = await axios.get(url);
      return resp;
    });

    const metaDataRes = await Promise.all(metaData);
    return metaDataRes?.map?.((item: any) => item.image);
  }

  return {
    balanceObj,
    hasAllowForAll,
    isApprovedForAll,
    setApprovalForAll,
    transferFrom,
    getBalance,
    tokenURI,
  };
};
