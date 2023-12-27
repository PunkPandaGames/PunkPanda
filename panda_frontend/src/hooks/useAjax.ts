import { reactive, ref, Ref, UnwrapRef, watch } from 'vue';
import { useAppStore } from '@store/appStore';
import axios from '@/service/request';

interface IAjaxEx<T> {
  loading: boolean; // load
  refresh: () => Promise<UnwrapRef<T>>; // refresh core
  cancel: () => void; // cancel
}

export interface IAxiosResp<T> {
  code: string; // code
  msg: string; // msg
  success: boolean; 
  data?: T; // data
  [key: string]: any; // props
}

interface IOption<T, P> {
  params?: P; // params
  before?: (axios) => Promise<P>; // before use 
  after?: (resp: IAxiosResp<T>) => UnwrapRef<T>; // after use
  wallet?: boolean; // need wallet
  default: T; // default
  immediate?: boolean; 
  noLoadBlock?: boolean; // load
  interval?: number; // interval
  watcher?: any; // watch
}

/**
 * base request
 * @param method 
 * @param url 
 * @param options 
 */
function useBaseRequest<T, P>(
  method: string,
  url: string | Ref<string>,
  options: IOption<T, P>
): [Ref<any>, IAjaxEx<T>] {
  const appStore = useAppStore();
  let cancelTokenSource;

  /**
   * result
   */
  const result = reactive<IAjaxEx<T>>({
    loading: false,
    refresh,
    cancel,
  });

  const datas = ref<T>(options?.default); // datas
  /**
   * refresh core
   */
  async function refresh(): Promise<UnwrapRef<T>> {
    return new Promise(async (resolve, reject) => {
      if (options.wallet) {
        watch(
          () => [appStore.defaultAccount],
          async () => {
            if (!+appStore.defaultAccount) {
              // no account
              return;
            }
            const resp = await core();
            resolve(resp);
          },
          {
            immediate: true,
          }
        );
      } else {
        const resp = await core();
        resolve(resp);
      }
    });
  }

  /**
   * cancel
   */
  async function cancel() {
    cancelTokenSource?.cancel?.();
  }

  async function core(): Promise<UnwrapRef<T>> {
    if (result.loading && !options.noLoadBlock) return;

    if (options.noLoadBlock) {
      cancel(); // cancel
    }
    cancelTokenSource = axios.CancelToken.source();

    result.loading = true;
    // first before
    const beforeResp = await options?.before?.(axios);
    let params = beforeResp || options.params;

    function request(method: string, payload): Promise<IAxiosResp<T>> {
      // ref to url
      const tempUrl = isRef(payload.url) ? payload.url.value : payload.url;

      const tempParams = isRef(payload.params) ? payload.params.value : payload.params;

      // ref-body
      for (const key in tempParams) {
        if (Object.prototype.hasOwnProperty.call(tempParams, key)) {
          const p = tempParams[key];
          if (isRef(p)) {
            tempParams[key] = p.value;
          }
        }
      }

      if (method === 'get' || method === 'delete') {
        return axios[method](tempUrl, {
          params: tempParams,
          cancelToken: cancelTokenSource.token,
        });
      } else {
        return axios[method](tempUrl, tempParams, {
          cancelToken: cancelTokenSource.token,
        });
      }
    }

    return await request(method, { url, params })
      .then(async (resp) => {
        datas.value = await options.after(resp);
        return datas.value;
      })
      .catch(async (err) => {
        datas.value = await options.after(err);
        return datas.value;
      })
      .finally(() => {
        result.loading = false;
      });
  }

  // need wallet
  if (options?.wallet) {
    watch(
      () => [appStore.defaultAccount],
      () => {
        if (!+appStore.defaultAccount) {
          // no account
          return;
        }
        core();
      },
      {
        immediate: options?.immediate ?? false,
      }
    );
  } else {
    // on wallet
    if (options?.immediate === true) {
      // immediate
      core();
    } else {
    }
  }

  // watcher
  if (options?.watcher) {
    watch(options.watcher, () => core());
  }

  // interval
  let timer;
  if (options?.interval) {
    clearInterval(timer);
    timer = setInterval(() => {
      core();
    }, options.interval);
  }

  onBeforeUnmount(() => {
    timer && clearInterval(timer);
  });

  return [datas, result];
}

/**
 * get
 * @param url 
 * @param options 
 */
export function useGet<T, P>(url: string | Ref<string>, options: IOption<T, P>): [Ref<T>, IAjaxEx<T>] {
  return useBaseRequest<T, P>('get', url, options);
}

/**
 * post 
 * @param url 
 * @param options 
 */
export function usePost<T, P>(url: string | Ref<string>, options: IOption<T, P>): [Ref<T>, IAjaxEx<T>] {
  return useBaseRequest<T, P>('post', url, options);
}

/**
 * put
 * @param url 
 * @param options 
 */
export function usePut<T, P>(url: string | Ref<string>, options: IOption<T, P>): [Ref<T>, IAjaxEx<T>] {
  return useBaseRequest<T, P>('put', url, options);
}

/**
 * patch 
 * @param url 
 * @param options 
 */
export function usePatch<T, P>(
  url: string | Ref<string>,
  options: IOption<T, P>
): [Ref<any>, IAjaxEx<T>] {
  return useBaseRequest<T, P>('patch', url, options);
}

/**
 * delete 
 * @param url 
 * @param options 
 */
export function useDelete<T, P>(
  url: string | Ref<string>,
  options: IOption<T, P>
): [Ref<any>, IAjaxEx<T>] {
  return useBaseRequest<T, P>('delete', url, options);
}
