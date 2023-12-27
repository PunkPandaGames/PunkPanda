import { STAKE_CONT } from '@/contracts/address';
import { useAppStore } from '@store/appStore';
import i18n from '@/locales/i18n';
import useDefaultRpc from './useDefaultRpc';
import { bpDiv, bpFormat, bpMul } from 'bp-math';
import { bpRead, bpWrite } from '@/service/bpAction';
import { ElMessage } from 'element-plus';
import { watchAccount } from '@/hooks/useAction';
import { reactive, Ref, ref } from 'vue';

const $t = i18n.global.t;

export default () => {
  const appStore = useAppStore();
  const created = ref<boolean>(false);
  const stakeObj = ref<any>({});
  const decimals = ref<number>(18);


  async function createContract() {
    const signer = useDefaultRpc();
    try {
      stakeObj.value = new appStore.ethersObj.ethers.Contract(
        STAKE_CONT.address,
        STAKE_CONT.abi,
        signer
      );
    } catch (error) {
      console.log('构建质押合约对象失败', error);
    }
    created.value = true;
    return stakeObj;
  }
  createContract();


  watchAccount(() => {
    createContract();
  });

  const inviter = ref('');
  async function userInfo() {
    const resp = await bpRead(stakeObj.value.userInfo, appStore.defaultAccount);
    if (!resp.status) console.log('getUserInfo...error...');
    inviter.value = resp.datas?.invitor || '';
    return resp;
  }

  async function isFinished() {
    const resp = await bpRead(stakeObj.value.isFinished);
    console.log('isFinished。。,', resp);
    if (!resp.status) console.log('isFinished...error...');
    return resp.datas;
  }

  async function curEpoch() {
    const resp = await bpRead(stakeObj.value.curEpoch);
    if (!resp.status) console.log('curEpoch...error...');
    return +resp.datas;
  }

  async function curTaskAmount() {
    const resp = await bpRead(stakeObj.value.feedAmount);
    console.log('curTaskAmount,', resp);
    if (!resp.status) console.log('curTaskAmount...error...');
    return bpDiv(resp.datas, 10 ** 18, {deci: -2})
  }

  async function stakeAmount(count: string) {
    const resp = await bpRead(stakeObj.value.epochStakeInfo, count);
    if(!resp.status) console.log('stake amount err');
    return bpDiv(resp.datas, 10 ** 18, {deci: -2})
  }

  async function curStakeAmount() {
    const curEpochRes = await bpRead(stakeObj.value.curEpoch);
    const curStakeAmountRes = await bpRead(stakeObj.value.epochStakeInfo, +curEpochRes.datas);
    
    if (!curStakeAmountRes.status) {
      console.log('curStakeAmount err...');
      return '0.00';
    }
    console.log('cur stake...',bpDiv(curStakeAmountRes.datas, 10 ** 18, {deci: -2}));
    
    return bpDiv(curStakeAmountRes.datas, 10 ** 18, {deci: -2})
  }

  async function getTimeInfo() {
    const startTimeRes = bpRead(stakeObj.value.startTime);
    const curEndTimeRes = bpRead(stakeObj.value.curEndTime);
    const res = await Promise.all([startTimeRes, curEndTimeRes]);
    if (!res[0].status || !res[1].status) {
      console.log('tatal end time err...');
      return {
        startTime: 0,
        curEndTime: 0
      };
    }
    return {
      startTime: bpMul(res[0].datas,1000), 
      curEndTime: bpMul(res[1].datas,1000)
    };
  }

  async function getEpochInfo(curEpoch:string) {
    const res = await bpRead(stakeObj.value.getEpochStakeInfo, curEpoch);
    if (!res.status) console.log('get epoch info err..');
    return res.datas
  }

  async function stake(amount: BigNumStr) {
    const cloneAmount = bpMul(amount, 10 ** 18);
    const { status } = await bpWrite({ success: $t('base.7') }, stakeObj.value.stake, {
      value: cloneAmount
    });
    return status;
  }

  return {
    created,
    inviter,
    userInfo,
    createContract,
    stake,
    isFinished,
    getTimeInfo,
    curEpoch,
    stakeAmount,
    getEpochInfo,
    curTaskAmount,
    curStakeAmount
  };
};
