import { ElMessage } from 'element-plus';
import { reactive, ref, Ref, UnwrapRef, watch } from 'vue';
import { useRouteItem } from '@/router/useRouterTools';
import { useAppStore } from '@store/appStore';
import i18n from '@/locales/i18n';
import { checkRightChain } from '@/router/routerHelp';
import { clone } from '@/utils/tools';

const $t = i18n.global.t;

interface IUseRead<T> {
  loading: boolean; // load
  status: null | boolean; // status
  message: string; // message
  refresh: (e?) => Promise<T>; // refresh
  cancel: () => void; // cancel
  execute: () => Promise<T>; // execute
  stopInterval: () => void; // stop Interval
}

interface IEx<T> {
  default: T; // default data
  interval?: number; // interval (ms)
  watcher?: any; // watch
  immediate?: boolean; // immediate
  noAccount?: boolean; // noAccount
}

/**
 * write hook
 * @param func bc()
 * @returns
 * eg:
 *  const [forgive, loadForgive] = useWrite(async () => {
 *    const resp = await boxObj.directDepositIt(1);
 *  });
 */
export function useWrite(
  func: (...params) => Promise<void>
): [(...params) => Promise<void>, Ref<boolean>] {
  const route = useRouteItem();
  const appStore = useAppStore();
  const loading = ref(false);
  async function run(...params) {
    if (loading.value) return;

    // no etherum
    if (!window.ethereum) {
      window.open('https://metamask.io/download/');
      return;
    }

    // no right chain
    if (!appStore.rightChain) {
      // err
      ElMessage.error($t('base.8'));

      // swtich chain
      loading.value = true;
      await appStore.switchChain(route.meta.needChains[0]);
      loading.value = false;
      return;
    }

    // no account
    if (!appStore.defaultAccount) {
      ElMessage.error($t('base.16'));
      loading.value = true;
      await appStore.linkWallet();
      loading.value = false;
      return;
    }

    loading.value = true;
    await func(...params);
    loading.value = false;
  }

  return [run, loading];
}

/**
 * read hook
 * @param func bc()
 * @returns
 * tips: return data add .values
 * 
 * eg:
 *  const [checkInfo, checkInfoEX] = useRead(async () => {
      const p1 = lpContract.getBalance();
      const p2 = lpContract.getBalance();
      const result = await Promise.all([p1, p2]);
      return result; 
    }); 
 * 
 */
export function useRead<T>(func: (e?) => Promise<T>, ex: IEx<T>): [Ref<UnwrapRef<T>>, IUseRead<T>] {
  const appStore = useAppStore();
  const datas = ref<T>(ex.default); // datas

  // cancel controller
  let currentController: AbortController, signal: AbortSignal;

  /**
   * createCancelSignal
   */
  function createCancelSignal() {
    const controller = new AbortController();
    currentController = controller;
    signal = controller.signal;
  }

  /**
   * aborter
   * @param p1
   * @param signal
   * @param controller
   * @returns
   */
  async function aborter(p1: Promise<any>) {
    createCancelSignal();

    const p2 = new Promise((resolve, reject) => {
      /**
       * reject Promise
       */
      function cancelPromise() {
        signal.removeEventListener('abort', cancelPromise);
        return reject('cancel');
      }
      // watch
      if (signal) {
        signal.addEventListener('abort', cancelPromise);
      }
    });

    return await Promise.race([p1, p2]);
  }

  /**
   * cancel
   */
  const cancel = () => {
    currentController?.abort?.();
  };

  /**
   * result
   */
  const result = reactive<IUseRead<T>>({
    loading: false,
    status: null,
    message: '',
    refresh,
    cancel,
    execute,
    stopInterval: () => {},
  });

  /**
   * core
   */
  async function core(e?) {
    // cancel();
    result.loading = true;
    const req = aborter(func(e));
    const resp = await req.catch((err) => {
      console.log(err);
      return false;
    });

    result.loading = false;

    if (!resp) return resp;

    if (resp?.status === false) {
      // err msg
      result.message = resp?.message;
      result.status = false;
    } else {
      // datas
      datas.value = clone(resp, true);
      result.status = true;
    }
    return resp;
  }

  /**
   * execute
   * @param e
   */
  async function execute(e?): Promise<T> {
    return new Promise((resolve, reject) => {
      if (ex?.noAccount) {
        // no account
        core(e)
          .then(async (resp) => {
            resolve(resp);
          })
          .catch((err) => {
            resolve(err);
          });
      } else {
        // need account
        watch(
          () => [appStore.defaultAccount, appStore.ethersObj.chainId, appStore.netWorkReady],
          () => {
            if (!appStore.defaultAccount || !appStore.ethersObj.chainId || !appStore.netWorkReady)
              return;

            core(e)
              .then(async (resp) => {
                resolve(resp);
              })
              .catch((err) => {
                resolve(err);
              });
          },
          {
            immediate: true,
          }
        );
      }
    });
  }

  /**
   * refresh
   */
  async function refresh(e?): Promise<T> {
    return new Promise((resolve, reject) => {
      core(e)
        .then(async (resp) => {
          resolve(resp);
        })
        .catch((err) => {
          resolve(err);
        });
    });
  }

  if (ex?.immediate === false) {
    // no immediate
    watch(
      () => [appStore.touchRefreshRead],
      () => {
        core();
      }
    );
  } else {
    // immediate
    if (ex?.noAccount) {
      // no account
      core();
      watch(
        () => [appStore.touchRefreshRead],
        () => {
          core();
        }
      );
    } else {
      // need account
      watch(
        () => [
          appStore.defaultAccount,
          appStore.ethersObj.chainId,
          appStore.netWorkReady,
          appStore.touchRefreshRead,
        ],
        () => {
          if (!appStore.defaultAccount || !appStore.ethersObj.chainId || !appStore.netWorkReady)
            return;

          core();
        },
        {
          immediate: true,
        }
      );
    }
  }

  // watcher
  if (ex?.watcher) {
    watch(ex.watcher, () => core());
  }

  // interval
  let timer;
  if (ex?.interval) {
    clearInterval(timer);
    timer = setInterval(() => {
      core();
    }, ex.interval);
    result.stopInterval = () => {
      clearInterval(timer);
    };
  }

  onBeforeUnmount(() => {
    timer && clearInterval(timer);
  });

  return [datas, result];
}

/**
 * watchAccount swich chain
 */
export function watchAccount(func: () => void): void {
  const appStore = useAppStore();

  watch(
    () => [appStore.defaultAccount, appStore.ethersObj.chainId, appStore.netWorkReady],
    (newVal, oldVal) => {
      if (!appStore.defaultAccount || !appStore.ethersObj.chainId || !appStore.netWorkReady) return;

      checkRightChain();
      func();

      nextTick(() => {
        appStore.setTouchAfterWatchAccount(appStore.touchAfterWatchAccount + 1);
      });
    },
    {
      immediate: true,
    }
  );
}
