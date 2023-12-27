import { reactive, readonly } from '@vue/reactivity';

const state = reactive({
  loading: false,
  style: '',
});

const loadStore = readonly(state);

/**
 * show load
 * @param {Boolean} payload 
 */
function setLoad(payload) {
  state.loading = payload;
}

/**
 * set load style
 * @param Strying payload 
 */
 function setLoadStyle(payload) {
  state.style = payload;
}

export { loadStore, setLoad, setLoadStyle };
