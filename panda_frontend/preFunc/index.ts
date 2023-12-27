import i18n from '@/locales/i18n';


export function $f(param: string): string {
  return param;
}


export function $p(param: string): string {
  return param;
}

export function $t(param: string): string {
  return i18n.global.t(param);
}
