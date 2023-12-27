import { createApp, h, watch } from 'vue';
import Loading from './index.vue';
import { loadStore, setLoad, setLoadStyle } from './useLoad';


const loadWrap = createApp({
  setup(props) {},
  render() {
    return h(Loading);
  },
});
const parent = document.createElement('div');
const instance = loadWrap.mount(parent);

let lock = false; 

function installLoad({ isShow, style = '' }) {
  setLoadStyle(style);
  if (isShow) {
    if (!lock) {
      document.body.appendChild(instance.$el);
      setLoad(true);
      lock = true;
    } else {
      setLoad(true);
    }
  } else {
    if (lock) {
      setLoad(false);
    }
  }
}

watch(
  () => loadStore.loading,
  (newValue, oldValue) => {
    if (newValue) {
      instance.$el.style.display = 'block';
    } else {
      instance.$el.style.display = 'none';
    }
  }
);

export default installLoad;
