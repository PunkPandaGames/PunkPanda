import i18n from '@/locales/i18n';
import { useAppStore } from '@/store/appStore';
import { ElMessage } from 'element-plus';
import { reactive, readonly } from 'vue';

export interface IMemu {
  id: number;
  name: string;
  logo: any;
  urlName: string;
  active: boolean;
  children?: IMemu[];
}

// 菜单列表
const menuListValue = reactive<IMemu[]>([
  {
    id: 1,
    name: 'base.3',
    logo: require('@img/holder.png'),
    urlName: 'home',
    active: false,
  },
  {
    id: 2,
    name: 'base.4',
    logo: require('@img/holder.png'),
    urlName: 'testPage',
    active: false,
  },
]);

/**
 * setMenuList
 * @param menuItem 
 */
export function setMenuList(menuItem) {
  menuListValue.forEach((item) => {
    if (menuItem.id === item.id) {
      item = menuItem;
    }
  });
}

export const useTopBar = () => {
  const appStore = useAppStore();
  const router = useRouter();
  const $t = i18n.global.t;

  const gThis = getCurrentInstance().appContext.config.globalProperties;

  const loadLink = ref(false);
  /**
   * handleLink
   */
  async function handleLink() {
    if (loadLink.value) return;
    loadLink.value = true;
    await appStore.linkWallet();
    loadLink.value = false;
  }

  // langList
  const langList = reactive([
    {
      id: 1,
      name: '中文',
      target: 'cn',
      active: true,
    },
    {
      id: 2,
      name: 'English',
      target: 'en',
      active: false,
    },
  ]);

  // curLang
  const curLang = computed(() => langList.find((item) => item.target === appStore.curLang).name);

  /**
   * launchTo
   * @param {Object} item
   */
  function launchTo(item) {
    // out link
    if (item.link) {
      window.open(item.link);
      return;
    }

    if (item.urlName === '' || item.urlName === '/') {
      ElMessage({
        type: 'info',
        message: $t('base.2'),
      });
      return;
    }

    if (item.urlName !== '/') {
      router.push({ name: item.urlName });
    }
  }

  /**
   * pickLang
   */
  function pickLang(lang) {
    gThis.$i18n.locale = lang.target;
    appStore.setLang(lang.target);
    langList.forEach((item) => {
      item.active = lang.id === item.id;
    });
  }

  return {
    langList,
    curLang,
    loadLink,
    pickLang,
    launchTo,
    handleLink,
  };
};

export const menuList = readonly(menuListValue);
