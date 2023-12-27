
import router from '@/router';
import { useAppStore } from '@/store/appStore';
import { Ref } from 'vue-demi';
import { RouteRecordRaw } from 'vue-router';


type IExtraParam = {
  query: Object;
};

type ICurRoute = IExtraParam & RouteRecordRaw;


export function useRouteItem(): ICurRoute {
  const curRouteQuery = _queryURLparams(window.location.href);

  let curRouterPath = String(router.options?.history?.state?.current);
  curRouterPath = curRouterPath?.replace?.(/\?\S*/, '');

  let curPath;

  const allRouter = router?.options?.routes;

  const homePage = allRouter.find((item) => item.path === '/');

  if (curRouterPath === '/') {
    return {
      ...homePage,
      query: curRouteQuery,
    };
  }

  const pathArrs = curRouterPath.split('/').filter((item) => item);

  curPath = pathArrs[pathArrs.length - 1];

  function _findLeaves(name: string, aLeave) {
    const p = aLeave?.path?.split('/');
    if (name === p?.[p?.length - 1]) {
      return aLeave;
    }

    for (let i = 0, len = aLeave?.children?.length; i < len; i++) {
      const itemLeave = aLeave.children[i];
      const resp = _findLeaves(name, itemLeave);
      if (resp) {
        return resp;
      }
    }
  }

  let atHomeLeave, atOtherPageLeave;
  for (let i = 0, len = homePage?.children?.length; i < len; i++) {
    const child = homePage.children[i];
    atHomeLeave = _findLeaves(curPath, child);
  }

  if (!atHomeLeave) {
    const otherPath = allRouter.find((item) => {
      const itemPath = item?.path?.split('/').filter((item) => item);
      return pathArrs?.[0] === itemPath[0];
    });
    atOtherPageLeave = _findLeaves(curPath, otherPath);
  }

  const curRouteItem = atHomeLeave || atOtherPageLeave;

  return {
    ...curRouteItem,
    query: curRouteQuery,
  };
}

export function useRouteMeta() {
  const routeItem = useRouteItem();
  return routeItem?.meta;
}

export function useRouteQuery() {
  const routeItem = useRouteItem();
  return routeItem?.query;
}

export function useRouteItemRef(): Ref<ICurRoute> {
  const routeItem = ref({}) as Ref<ICurRoute>;
  watch(
    () => useAppStore().touchUrl,
    () => {
      routeItem.value = useRouteItem();
    },
    { immediate: true }
  );

  return routeItem;
}

function _queryURLparams(url) {
  let obj = {};
  if (url.indexOf('?') < 0) return obj;
  let arr = url.split('?');

  const t1 = arr.filter((item, inx) => inx > 0);

  for (let j = 0, jlen = t1.length; j < jlen; j++) {
    const l = t1[j];
    const tArr = l.split('&');

    for (let i = 0; i < tArr.length; i++) {
      let arr2 = tArr[i];
      let arr3 = arr2.split('=');
      obj[arr3[0]] = arr3[1];
    }
  }

  return obj;
}
