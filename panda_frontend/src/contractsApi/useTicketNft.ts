import { ethers } from 'ethers';
import { useAppStore } from '@/store/appStore';
import i18n from '@/locales/i18n';
import { TICKET_CONT, STAKE_CONT } from '@/contracts/address';
import { bpDiv, bpMul, bpSub } from 'bp-math';
import { bpRead, bpWrite } from '@/service/bpAction';
import useDefaultRpc from './useDefaultRpc';
import { getChainData } from '@/utils/tools';
import { useRouteItem } from '@/router/useRouterTools';
import { reactive, Ref, ref } from 'vue';
import { watchAccount } from '@/hooks/useAction';
import axios from '@/service/request';

const $t = i18n.global.t;

export default () => {
  const appStore = useAppStore();
  const created = ref<boolean>(false); 
  const nftObj = ref<any>({}); 
  const stakeObj = ref<any>({});


  function createContract() {
    const signer = useDefaultRpc();
    try {
      nftObj.value = new ethers.Contract(TICKET_CONT.address, TICKET_CONT.abi, signer);
      stakeObj.value = new ethers.Contract(STAKE_CONT.address, STAKE_CONT.abi, signer);
    } catch (error) {
      console.log('构建nft合约对象失败...');
    }
    created.value = true;
    return nftObj;
  }
  createContract();

  watchAccount(() => {
    createContract();
  });


  const balanceObj = reactive({
    origin: '0',
    show: '0'
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


  async function totalInfos() {
    const routeItem = useRouteItem();
    const chainData = getChainData(routeItem?.meta?.needChains?.[0]);
    const provider = new ethers.providers.JsonRpcProvider(chainData?.rpcUrls?.[0]);
    const totalAmountRes = await provider.getBalance(STAKE_CONT.address);
    const epochRes = bpRead(stakeObj.value.curEpoch);
    const ownersRes = bpRead(nftObj.value.owners);
    const res = await Promise.all([epochRes, ownersRes]);
    if (!res[1].status || !res[1].status) {
      console.log('tatal info err...');
      return {
        curEpoch: 1,
        totalAmount: 0,
        totalOwners: 0
      };
    }
    const newOwners = new Set(res[1].datas);
    
    console.log('res...', totalAmountRes, res, newOwners);
    return {
      curEpoch: +res[0].datas,
      totalAmount: bpDiv(+totalAmountRes, 10 ** 18, { deci: 2 }),
      totalOwners: newOwners.size
    };
  }

  async function isFinished() {
    const res = await bpRead(nftObj.value.totalSupply);
    if (!res.status) console.log('total supply err..');
    if (+res.datas >= 1000) {
      return true;
    } else {
      return false;
    }
  }

  async function mintInfo() {
    const res = await bpRead(nftObj.value.totalSupply);
    if (!res.status) console.log('total supply err..');
    return {
      totalMint: +res.datas,
      remain: bpSub(1000, +res.datas),
      isEnd: +bpSub(1000, +res.datas) > 0 ? false : true
    };
  }

  async function mintFee() {
    const res = await bpRead(nftObj.value.mintFee);
    if (!res.status) console.log('mintFeed err..');
    console.log('mint fee..', res);
    
    return res.datas;
  }

  async function mint(num: string, mintFee:any) {
    const mintFees = await bpRead(nftObj.value.mintFee);
    const fee = bpMul(num, mintFees.datas);
    console.log('mint fee...', fee, num, mintFee);
    
    const { status } = await bpWrite(
      { success: $p('Mint Successfully') },
      nftObj.value.mint,
      num,
      { value: fee }
    );
    return status;
  }


  async function tokenURI(ids: number[]) {
    const resp = ids.map(async id => {
      const { datas } = await bpRead(nftObj.value.tokenURI, id);
      return datas;
    });

    const res = await Promise.all(resp);

    const metaData = res.map(async url => {
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
    mint,
    totalInfos,
    isFinished,
    mintInfo,
    mintFee
  };
};
