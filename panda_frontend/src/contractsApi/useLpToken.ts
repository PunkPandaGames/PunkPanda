import { ethers } from 'ethers';
import { useAppStore } from '@/store/appStore';
import i18n from '@/locales/i18n';
import { bpFormat, bpGt, bpGte, bpMul } from 'bp-math';
import { bpRead, bpWrite } from '@/service/bpAction';
import useDefaultRpc from './useDefaultRpc';
import { reactive, Ref, ref } from 'vue';
import { watchAccount } from '@/hooks/useAction';

const $t = i18n.global.t;

export default (addressObj: IAddressObj) => {
  const appStore = useAppStore();
  const created = ref<boolean>(false); // 
  const lpObj = ref<any>({});
  const decimals = ref<number>(18);


  function createContract(addressObj: IAddressObj) {
    const signer = useDefaultRpc();
    try {
      lpObj.value = new ethers.Contract(addressObj.address, addressObj.abi, signer);
    } catch (error) {
      console.log('构建Lp合约对象失败...');
    }
    created.value = true;
    return lpObj;
  }
  createContract(addressObj);

  watchAccount(() => {
    createContract(addressObj);
  });

  const balanceObj = reactive({
    origin: '0',
    show: '0',
  });
  /**
   * getBalance
   * @param digi 
   * @param addr 
   */
  async function getBalance(digi: number = 2, addr?: string) {
    const targetAddr = addr ?? appStore.defaultAccount;

    const { status, datas } = (await bpRead(lpObj.value.balanceOf, targetAddr)) || {};
    if (!status) console.log('getBalance...error...');

    balanceObj.origin = status ? datas : '0';
    balanceObj.show = status ? bpFormat(datas, -digi, decimals.value) : '0';

    return balanceObj;
  }

  // tokens
  const tokenArr = reactive<string[]>(['', '']);
  /**
   * getTokens
   */
  async function getTokens(): Promise<string[]> {
    const token0 = await bpRead(lpObj.value.token0);
    const token1 = await bpRead(lpObj.value.token1);
    const [{ datas: tokenRes0, status: sta1 }, { datas: tokenRes1, status: sta2 }] =
      await Promise.all([token0, token1]);

    if (!sta1 || !sta2) console.log('getTokens...error');
    tokenArr[0] = tokenRes0;
    tokenArr[1] = tokenRes1;

    return tokenArr;
  }

  // reserv
  interface IRev {
    revOrigin;
    revShow;
  }
  const revObj = reactive<IRev[]>([
    {
      revOrigin: '0',
      revShow: '0',
    },
    {
      revOrigin: '0',
      revShow: '0',
    },
  ]);
  /**
   * getReserves
   * @param digi 
   */
  async function getReserves(digi: number = 2) {
    const { status, datas } = await bpRead(lpObj.value.getReserves);
    if (!status) console.log('getReserves...error');
    revObj[0].revOrigin = status ? datas[0] : '0';
    revObj[0].revShow = status ? bpFormat(datas[0], digi) : '0';
    revObj[1].revOrigin = status ? datas[1] : '0';
    revObj[1].revShow = status ? bpFormat(datas[1], digi) : '0';

    return revObj;
  }


  const tokenRevs = reactive([
    {
      token: '',
      revOrigin: '',
      revShow: '',
    },
    {
      token: '',
      revOrigin: '',
      revShow: '',
    },
  ]);
  /**
   * getTokenReserves
   * @param tokenA
   * @param tokenB
   */
  async function getTokenReserves(tokenA: string, tokenB: string) {
    const [token0, token1] = await getTokens();
    const [reserveAObj, reserveBObj] = await getReserves();

    if (token0.toUpperCase() === tokenA.toUpperCase()) {
      // token0
      tokenRevs[0].token = token0;
      tokenRevs[0].revOrigin = reserveAObj.revOrigin;
      tokenRevs[0].revShow = reserveAObj.revShow;

      tokenRevs[1].token = token1;
      tokenRevs[1].revOrigin = reserveBObj.revOrigin;
      tokenRevs[1].revShow = reserveBObj.revShow;
    } else {
      // token1
      tokenRevs[1].token = token0;
      tokenRevs[1].revOrigin = reserveAObj.revOrigin;
      tokenRevs[1].revShow = reserveAObj.revShow;

      tokenRevs[0].token = token1;
      tokenRevs[0].revOrigin = reserveBObj.revOrigin;
      tokenRevs[0].revShow = reserveBObj.revShow;
    }

    return tokenRevs;
  }

  // hasAllow
  const hasAllow = ref(false);
  /**
   * hasAllow
   * @param {String} hoster 
   * @returns {Boolean} 
   */
  async function allow(hoster: string): Promise<boolean> {
    const allowance = (await bpRead(lpObj.value.allowance, appStore.defaultAccount, hoster)) || {};
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
   * @param {String} hoster 
   */
  async function auth(hoster: string) {
    const { status } = await bpWrite(
      { success: $t('base.5') },
      lpObj.value.approve,
      hoster,
      ethers.constants.MaxUint256
    );
    return status;
  }


  async function transfer(recipient: string, amount) {
    const cloneAmount = bpMul(amount, 10 ** decimals.value);
    const { status } = await bpWrite(
      { success: $t('base.6') },
      lpObj.value.transfer,
      recipient,
      cloneAmount
    );
    return status;
  }


  async function transferFrom(sender: string, recipient: string, amount) {
    const cloneAmount = bpMul(amount, 10 ** decimals.value);
    const { status } = await bpWrite(
      { success: $t('base.6') },
      lpObj.value.transferFrom,
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
    tokenArr,
    tokenRevs,
    revObj,
    hasAllow,
    createContract,
    getBalance,
    getTokens,
    getReserves,
    getTokenReserves,
    allow,
    auth,
    transfer,
    transferFrom,
  };
};
