
import { ethers } from 'ethers';
import { useAppStore } from '@/store/appStore';
import i18n from '@/locales/i18n';
import { bpFormat, bpGt, bpGte, bpMul } from 'bp-math';
import { bpRead, bpWrite } from '@/service/bpAction';
import useDefaultRpc from './useDefaultRpc';
import { reactive, ref } from 'vue';
import { watchAccount } from '@/hooks/useAction';
import { sleep } from '@/utils/tools';

const $t = i18n.global.t;

export default (addressObj: IAddressObj) => {
  const appStore = useAppStore();
  const created = ref<boolean>(false); 
  const coinObj = ref<any>({}); 
  const decimals = ref<number>(18); 

  /**
   * createContract
   * @param {Object} addressObj：
   * @returns 
   */
  async function createContract(addressObj) {
    const signer = useDefaultRpc();
    coinObj.value = new ethers.Contract(addressObj.address, addressObj.abi, signer);

    created.value = true;
    return coinObj;
  }
  createContract(addressObj);

  // watchAccount
  watchAccount(() => {
    createContract(addressObj);
  });

  /**
   * getDecimals
   */
  async function getDecimals(): Promise<number> {
    const { datas, status } = await bpRead(coinObj.value.decimals);
    if (!status) console.log('getDecimals...error...');
    decimals.value = +datas || 18;
    return decimals.value;
  }

  // balanceObj
  const balanceObj = reactive({
    origin: '0',
    show: '0',
  });
  /**
   * getBalance
   * @param digi 
   * @param addr account
   * @param deci 18
   */
  async function getBalance(digi: number = 2, addr?: string, deci: number = 18) {
    const targetAddr = addr ?? appStore.defaultAccount;

    const { status, datas } = (await bpRead(coinObj.value.balanceOf, targetAddr)) || {};
    if (!status) console.log('getBalance...error...');

    balanceObj.origin = status ? datas : '0';
    balanceObj.show = status ? bpFormat(datas, -digi, deci) : '0';

    return balanceObj;
  }

  // totalSupply
  const totalSupplyObj = reactive({
    origin: '0',
    show: '0',
  });
  /**
   * totalSupply
   * @param digi 
   * @param deci 
   */
  async function totalSupply(digi: number = 2, deci: number = 18) {
    const { status, datas } = await bpRead(coinObj.value.totalSupply);
    if (!status) console.log('totalSupply...error...');

    totalSupplyObj.origin = status ? datas : '0';
    totalSupplyObj.show = status ? bpFormat(datas, -digi, deci) : '0';

    return totalSupplyObj;
  }

  // hasAllow
  const hasAllow = ref(false);
  /**
   * hasAllow
   * @param {String} hoster acc
   * @returns {Boolean} true | false 
   */
  async function allow(hoster: string): Promise<boolean> {
    const allowance =
      (await bpRead(coinObj.value.allowance, appStore.defaultAccount, hoster)) || {};
    const balance = getBalance() || {};
    const [{ status, datas }, { origin }] = (await Promise.all([allowance, balance])) as any;

    if (!status) {
      console.log('allow...error...');
      return false;
    }

    hasAllow.value = +origin ? bpGte(datas, origin) : +datas ? true : false;
    return hasAllow.value;
  }

  /**
   * auth
   * @param {String} hoster acc
   * @returns {Boolean} 
   */
  async function auth(hoster: string): Promise<boolean> {
    const { status } = await bpWrite(
      { success: $t('base.5') },
      coinObj.value.approve,
      hoster,
      ethers.constants.MaxUint256
    );
    return status;
  }

  /**
   * transfer
   * @param recipient 
   * @param amount 
   * @param deci 
   */
  async function transfer(recipient: string, amount, deci: number = 18) {
    const cloneAmount = bpMul(amount, 10 ** deci);
    const { status } = await bpWrite(
      { success: $t('base.6') },
      coinObj.value.transfer,
      recipient,
      cloneAmount
    );

    return status;
  }

  /**
   * transferFrom
   * @param sender 
   * @param recipient 
   * @param amount 
   * @param deci 18
   * @returns
   */
  async function transferFrom(sender: string, recipient: string, amount, deci: number = 18) {
    const cloneAmount = bpMul(amount, 10 ** deci);
    const { status } = await bpWrite(
      { success: $t('base.6') },
      coinObj.value.transferFrom,
      sender,
      recipient,
      cloneAmount
    );
    if (!status) console.log('transferFrom...error...');

    return status;
  }

  return {
    created,
    balanceObj,
    totalSupplyObj,
    hasAllow,
    createContract,
    getDecimals,
    getBalance,
    totalSupply,
    allow,
    auth,
    transfer,
    transferFrom,
  };
};
