
import { ElMessage } from 'element-plus';
import i18n from '@/locales/i18n';
import { useAppStore } from '@/store/appStore';
import { getWalletReject } from '@/utils/tools';
const $t = i18n.global.t;


interface IMsgs {
  success?: string | boolean; // 
  error?: boolean; // 
}


interface ITransStatus {
  status: boolean; // 
  datas: any; // 
  errorOrigin?: string; 
  message?: string; 
}

export async function bpWrite(msgs: boolean | IMsgs, func, ...param): Promise<ITransStatus> {
  console.log('bpWrite入参: ', ...param);

  if (!func) {
    ElMessage.error('error');
    return {
      status: false,
      datas: '0',
    };
  }

  return func?.(...param)
    .then(async (resp) => {
      ElMessage({
        type: 'info',
        message: $t('base.10'),
      });
      const { events } = await resp?.wait?.();
      const notCondiction = msgs === false || msgs?.['success'] === false;

      if (typeof msgs === 'object' && typeof msgs?.success === 'string') {
        ElMessage.success(msgs.success);
      } else if (notCondiction) {
      } else {
        ElMessage.success('success');
      }

      return {
        status: true,
        datas: events,
      };
    })
    .catch((err) => {
      let info =
        err?.['reason'] || err?.data?.message || err?.error?.message || err?.message || err;

      if (getWalletReject(err)) {
        info = 'User denied transaction';
      }

      info = String(info).length > 200 ? 'error' : info;

      const notMsgCondiction = msgs === false || msgs?.['error'] === false;

      if (!notMsgCondiction) {
        ElMessage.error(info);
      }

      return {
        status: false,
        datas: '0',
        errorOrigin: err,
        message: info,
      };
    });
}

export async function bpRead(func, ...param: any[]): Promise<ITransStatus> {
  if (!func) {
    return;
  }
  return await func?.(...param)
    .then((resp) => {
      return {
        status: true,
        datas: resp,
      };
    })
    .catch((err) => {
      if (useAppStore().defaultAccount) {
        console.log('bpRead...error...');
      }
      return {
        status: false,
        datas: '0',
        errorOrigin: err,
        message: err,
      };
    });
}
