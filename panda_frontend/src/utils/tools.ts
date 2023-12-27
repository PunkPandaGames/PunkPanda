import { supportedChains } from '@/contracts/chains';


export function getRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function plusStar(str: string, frontLen: number, endLen: number) {
  if (str?.length === undefined) return '';
  var len = str.length - frontLen - endLen;
  var xing = '';
  for (var i = 0; i < len; i++) {
    xing = '....';
  }
  return str.substring(0, frontLen) + xing + str.substring(str.length - endLen);
}


export function clone(obj, deep: boolean) {
  if (Array.isArray(obj)) {
    if (deep) {
      let tempArr = [];
      obj.forEach((item) => {
        tempArr.push(clone(item, deep));
      });
      return tempArr;
    } else {
      return obj.slice(); 
    }
  } else if (typeof obj === 'object') {
    let newObj = {};
    for (const key in obj) {
      if (deep) {
        newObj[key] = clone(obj[key], deep);
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  } else {
    return obj;
  }
}

export function getChainData(chainId) {
  if (!chainId) {
    return supportedChains[0];
  }
  return supportedChains.find((chain) => chain.chainId === chainId);
}


export function sleep(gap: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, gap);
  });
}


export function getWalletReject(error): boolean {
  let info =
    error?.['reason'] || error?.data?.message || error?.error?.message || error?.message || error;
  // err msg
  let errorKeyTag = ['User denied', 'rejected'];
  let res = !!errorKeyTag.filter((it) => info?.includes?.(it)).length;
  return error === 'cancel' || res;
}


export function getImage(name: string) {
  return new URL(`../assets/img/${name}`, import.meta.url).href;
}


export function addEvent(obj, xEvent, fn) {
  if (obj.attachEvent) {
      obj.attachEvent('on' + xEvent, fn);
  } else {
      obj.addEventListener(xEvent, fn, false);
  }
}