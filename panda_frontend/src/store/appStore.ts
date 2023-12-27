import { defineStore, storeToRefs } from 'pinia';
import { ethers } from 'ethers';
import { ElMessage } from 'element-plus';
import i18n, { defaultLang } from '@/locales/i18n';
const $t = i18n.global.t;

import { toRaw } from 'vue';
import { getChainData, getWalletReject } from '@/utils/tools';

// 
const INIT_ETHERS = {
  ethers: ethers,
  instance: null,
  provider: {},
  signerValue: null, 
  connected: false,
  cachedProvider: null,
  baseGasPrice: 0, 
  chainId: '',
  // tips:
  // const appStore = useAppStore();
  // const { ethers, signerValue } = appStore.ethersObj;
  // const signer = toRaw(signerValue);
};

const useAppStore = defineStore('app', {
  state: () => ({
    defaultAccount: '', 
    lang: '',
    curDevice: 'pad',
    rightChain: true, 
    loadRead: '', 
    ethersObj: INIT_ETHERS,
    chainTimer: null, 
    netWorkReady: false, 
    touchUrl: 0, 
    touchAfterWatchAccount: 0, 
    touchRefreshRead: 0, 
    isOpenMenu: false,

    changeSignal: {
      countWallet: 0,
      countChain: 0,
    },
  }),

  actions: {
    async linkWallet(): Promise<void | boolean> {
      if (this.defaultAccount) {
        return true;
      }

      await this.setEthersObj();
      const { provider } = this.ethersObj;
      await provider
        ?.send('eth_requestAccounts', [])
        .then(async () => {
          ElMessage({
            message: $t('base.9'),
            type: 'success',
          });
          await this.getDefaultAccount();
        })
        .catch(() => {
          ElMessage({
            message: $t('base.11'),
            type: 'error',
          });
        });

      this.ethersObj.chainId = toRaw(provider).provider.chainId;
      this.subscribeProvider();
    },


    async setAccount(account: string) {
      this.defaultAccount = account;
    },


    async getDefaultAccount() {
      if (this.defaultAccount) return;
      let account;
      try {
        const { signerValue } = this.ethersObj;
        const signer = toRaw(signerValue);
        account = await signer.getAddress();
      } catch (err) {
        ElMessage({
          message: $t('base.12'),
          type: 'error',
        });
      }
      this.setAccount(account);
      return account;
    },


    async switchChain(chainId: string) {
      if (!window?.ethereum) {
        window.open('https://metamask.io/download/');
        return;
      }

      let ethereum = window?.ethereum;
      if (this.ethersObj.cachedProvider === 'bitkeep') {
        ethereum = window?.bitkeep?.ethereum;
      }

      const providerWrap: any = new ethers.providers.Web3Provider(ethereum, 'any');


      async function _handleChange() {
        if (+ethereum.chainId === +chainId) {
          return;
        }

        try {
          const hexChainId = ethers.utils.hexValue(chainId);
          return await providerWrap.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: hexChainId }],
          });
        } catch (error) {
          if (!getWalletReject(error)) {
            const chainData = getChainData(chainId);
            return await providerWrap.provider.request({
              method: 'wallet_addEthereumChain',
              params: [chainData],
            });
          }
        }
      }

      try {
        const oldChainId = this.ethersObj.chainId;
        await _handleChange().then(async () => {
          if (window.ethereum?.isTokenPocket) {
            ElMessage.info($t('base.13'));
          }

          clearInterval(this.chainTimer);
          this.chainTimer = setInterval(() => {
            const newProviderWrap: any = new ethers.providers.Web3Provider(window?.ethereum, 'any');
            const newChainId = newProviderWrap?.provider?.chainId;

            if (+newChainId !== +oldChainId) {
              this.ethersObj.chainId = newChainId;

              if (window.ethereum?.isTokenPocket) {
                const chainData = getChainData(newChainId);
                window.ethereum.rpc.rpcUrl = chainData.rpcUrls;
              }
              // 
              ElMessage.success($t('base.14'));

              clearInterval(this.chainTimer);
            }
          }, 500);
        });
      } catch (error) {
        ElMessage.error($t('base.15'));
        console.log('switchChain..', error);
      }
    },

    setLang(lang) {
      this.lang = lang;
      window.localStorage.setItem('lang', lang);
    },

    getCurDevice() {
      const clientWidth = window.innerWidth;
      if (clientWidth <= 750) {
        this.curDevice = 'phone';
      } else if (clientWidth <= 1280 && clientWidth > 750) {
        this.curDevice = 'pad';
      } else if (clientWidth <= 1440 && clientWidth > 1280) {
        this.curDevice = 'notebook';
      }else {
        this.curDevice = 'pc';
      }
    },


    async setEthersObj() {

      function _waiting(): Promise<any> {
        const duration = 100;
        return new Promise<void>((resolve, reject) => {
          let count = 0;
          const timer = setInterval(() => {
            if (window.ethereum) {
              resolve();
              clearInterval(timer);
            }
            count++;
            // 1s return
            const sec = (1 * 1000) / duration;
            if (count > sec) {
              reject();
              clearInterval(timer);
            }
          }, duration);
        });
      }

      await _waiting().catch((err) => console.log(err));

      let provider, signer;
      try {
        provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        signer = provider.getSigner();

        const price = await provider.getGasPrice();
        this.ethersObj.baseGasPrice = +price ?? 0;
      } catch (err) {
        console.log('err...', err);
      }

      this.ethersObj = {
        ...this.ethersObj,
        ethers,
        provider,
        signerValue: signer,
      };
    },

    setLoadRead(status) {
      this.loadRead = status;
    },


    async subscribeProvider() {
      // const { provider } = this.ethersObj;
      // console.log('provider.on....', provider.on);

      
      window.ethereum?.on('accountsChanged', (accounts) => {
        this.changeSignal.countWallet++;
        this.defaultAccount = accounts[0];
      });

      // chainChanged
      window.ethereum?.on('chainChanged', async (chainId) => {
        this.changeSignal.countChain++;
        this.ethersObj.chainId = chainId;
      });

    },

    watchChangeWallet(cb: (val?, oldVal?) => void) {
      watch(
        () => this.changeSignal,
        (val, oldVal) => {
          cb(val, oldVal);
        },
        {
          deep: true,
        }
      );
    },

    setRightChain(status: boolean) {
      this.rightChain = status;
    },

    setNetWorkReady(status: boolean) {
      this.netWorkReady = status;
    },

    setTouchAfterWatchAccount(count: number) {
      this.touchAfterWatchAccount = count;
    },

    refreshAllRead() {
      this.touchRefreshRead++;
    },

    setTouchUrl(count: number) {
      this.touchUrl = count;
    },
  },

  getters: {
    curLang() {
      return this.lang || window.localStorage.getItem('lang') || defaultLang;
    },
  },
});

export { storeToRefs, useAppStore };
