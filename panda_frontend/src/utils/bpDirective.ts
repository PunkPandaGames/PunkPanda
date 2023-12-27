

// <button v-load="loadAuth" />
// <button v-disable="{message: '已经置灰', value: true}" />
// <img src="@img/home.png" v-img.lazy="require('@img/holder.png')"/>

import { App, createApp, h } from 'vue';
import BpLoad from '@cps/BpLoad/BpLoadComp.vue';
import { ElMessage } from 'element-plus';


const maxDirective = (app) => {
  const core = (el, binding) => {
    const reg = /(\-?\d+\.?\d*)|(\-?\d*\d*)/;
    el.value = el.value.match(reg)[0];

    if (el.value > binding.value) {
      el.value = binding.value;
      const e = new Event('input');
      el.dispatchEvent(e);
    }
  };

  let handleCore = () => {};

  app.directive('max', {
    mounted(el, binding, vnode) {
      // handleCore.bind(core, el, binding);
      handleCore = core.bind(this, el, binding);
      el.addEventListener('keyup', handleCore);
    },

    updated(el, binding, vnode) {
      handleCore = core.bind(this, el, binding);
      el.addEventListener('keyup', handleCore);
    },
  });
};


const minDirective = (app) => {
  const core = (el, binding) => {
    const reg = /(\-?\d+\.?\d*)|(\-?\d*\d*)/;
    el.value = el.value.match(reg)[0];

    if (el.value < binding.value) {
      el.value = binding.value;
    }

    const e = new Event('input');
    el.dispatchEvent(e);
  };

  let handleCore = () => {};

  app.directive('min', {
    mounted(el, binding, vnode) {
      handleCore = core.bind(this, el, binding);
      el.removeEventListener('keyup', handleCore);
      el.addEventListener('keyup', handleCore);
    },

    updated(el, binding, vnode) {
      handleCore = core.bind(this, el, binding);
      el.removeEventListener('keyup', handleCore);
      el.addEventListener('keyup', handleCore);
    },
  });
};

const numberDirective = (app) => {
  app.directive('number', {
    mounted(el, binding, vnode) {
      const core = () => {
        const reg = /(\-?\d+\.?\d*)|(\-?\d*\d*)/;
        el.value = el.value.match(reg)[0];
        // vnode.props['onUpdate:modelValue'](666)
        const e = new Event('input');
        el.dispatchEvent(e);
      };

      el.addEventListener('keyup', core);
    },
  });
};


const doubleDirective = (app) => {
  app.directive('double', {
    mounted(el, binding, vnode) {
      const len = Math.abs(binding.value); 
      const core = () => {
        // let reg2 = new RegExp(`^\\D*(\\d*(?:\\.\\d{0,${binding.value}})?).*$`, 'g');
        const reg = binding.value > 0 ? /(\d+\.?\d*)|(\d*\d*)/ : /(\-?\d+\.?\d*)|(\-?\d*\d*)/;
        el.value = el.value.match(reg)?.[0];

        const regDot = /\.\d*/;
        const matcher = regDot.exec(el.value);

        if (matcher?.[0]?.length > len) {
          const dotInx = matcher.index; 
          el.value = el.value?.slice(0, dotInx + len + 1);
        }

        const e = new Event('input');
        el.dispatchEvent(e);
      };

      el.addEventListener('keyup', core);
    },
  });
};


const intDirective = (app) => {
  app.directive('int', {
    mounted(el, binding, vnode) {
      const core = () => {
        const reg = /(\d*)/;
        el.value = el.value.match(reg)?.[0];

        const e = new Event('input');
        el.dispatchEvent(e);
      };

      el.addEventListener('keyup', core);
    },
  });
};

/**
 * 
 * eg: <input v-integer />
 */
const integerDirective = (app) => {
  app.directive('integer', {
    mounted(el, binding, vnode) {
      const core = () => {
        const reg = /(\d*)/;
        el.value = el.value.match(reg)?.[0];

        const e = new Event('input');
        el.dispatchEvent(e);
      };

      el.addEventListener('keyup', core);
    },
  });
};

/**
 * 
 * eg: <button v-load="loadAuth" />
 */
const loadDirective = (app: App) => {
  app.directive('load', {
    mounted(el, binding) {
      createLoad(el, binding);
      const { newShow } = getShowStatus(binding);

      newShow ? showMask(el) : hideMask(el);
    },

    beforeUpdate(el, binding) {
      const { oldShow, newShow } = getShowStatus(binding);

      if (oldShow !== newShow) {
        newShow ? showMask(el) : hideMask(el);
      }
    },
  });

  /**
   * 
   */
  const createLoad = (el: HTMLElement, binding) => {
    
    const theme = binding.modifiers.dark ? 'dark' : 'light';

    let size = '30px'; 
    if (Array.isArray(binding.value)) {
      size = binding.value?.[1] ?? size;
    }

    const c = createApp({
      render() {
        return h(BpLoad, {
          class: `${theme}`,
          size,
        });
      },
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'bp-load-wrapper';
    wrapper.classList.add(theme);

    const ELStyle = getComputedStyle(el);

    const rounded = ELStyle.borderRadius;
    wrapper.style.borderRadius = rounded;

    wrapper.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    c.mount(wrapper);
    el.appendChild(wrapper);

    if (ELStyle.position === 'static') {
      el.style.position = 'relative';
    }
  };

  const getShowStatus = (binding) => {
    let oldShow, newShow;
    if (Array.isArray(binding.value)) {
      oldShow = binding.oldValue?.[0];
      newShow = binding.value[0];
    } else {
      oldShow = binding.oldValue;
      newShow = binding.value;
    }
    return { oldShow, newShow };
  };

 
  const showMask = (el: HTMLElement) => {
    const wrapper: HTMLElement = el.querySelector('.bp-load-wrapper');

    wrapper.style.display = 'block';
  };

  const hideMask = (el: HTMLElement) => {
    const wrapper: HTMLElement = el.querySelector('.bp-load-wrapper');

    wrapper.style.display = 'none';
  };
};


const disableDirective = (app: App) => {
  app.directive('disable', {
    mounted(el, binding, vnode) {
      createMask(el, binding);
      run(el, binding);
    },
    beforeUpdate(el, binding, vnode) {
      run(el, binding);
    },
  });

  const calcActiveItem = (binding) => {
    let activeItem;
    if (Array.isArray(binding.value)) {
      activeItem = binding.value.find((item) => item.value);
    } else if (Object.prototype.toString.call(binding.value) === '[object Object]') {
      activeItem = binding.value;
    } else {
      activeItem = binding.value ? { value: true } : null;
    }
    return activeItem;
  };


  const run = (el: HTMLElement, binding) => {
    const activeItem = calcActiveItem(binding);
    if (activeItem?.value) {
      showMask(el, binding);
    } else {
      hideMask(el, binding);
    }
  };

  const createMask = (el: HTMLElement, binding) => {
    const mask = document.createElement('div');
    mask.style.position = 'absolute';
    mask.style.top = '0';
    mask.style.left = '0';
    mask.style.width = '100%';
    mask.style.height = '100%';
    mask.style.zIndex = '99999';
    mask.style.borderRadius = getComputedStyle(el).borderRadius;
    mask.classList.add('bp-disable-mask');

    const activeItem = calcActiveItem(binding);

    mask.addEventListener('click', (e) => {
      activeItem?.message && ElMessage.error(activeItem?.message);
      e.stopPropagation();
    });

    el.appendChild(mask);
    const pos = getComputedStyle(el).position;

    if (pos === 'static') {
      el.style.position = 'relative';
    }
  };


  const showMask = (el: HTMLElement, binding) => {
    const maskDOM: HTMLElement = el.querySelector('.bp-disable-mask');
    if (binding.modifiers.dark) {
      el.style.filter = 'grayscale(98%)';
    }
    maskDOM && (maskDOM.style.display = 'block');
  };


  const hideMask = (el: HTMLElement, binding) => {
    const maskDOM: HTMLElement = el.querySelector('.bp-disable-mask');
    if (!maskDOM) return;
    el.style.filter = 'none';
    maskDOM && (maskDOM.style.display = 'none');
  };
};

/**
 * 
 * eg: <img src="@img/home.png" v-img.lazy="require('@img/holder.png')"/>
 * eg: <img src="@img/home.png" v-img.backup="[require('@img/holder.png')]" />
 */
const imgDirective = (app: App) => {
  function fetchImg(url) {
    return new Promise((resolve, reject) => {
      const bgImg = new Image();
      bgImg.src = url;
      bgImg.onload = () => {
        resolve(url);
      };
      bgImg.onerror = () => {
        reject(url);
      };
    });
  }

  app.directive('img', {
    mounted(el, binding, vnode) {
      const originSrc = el.src;

      if (binding.modifiers.lazy) {
        // 
        el.src = binding.value;
        // 
        fetchImg(originSrc).then(() => {
          el.src = originSrc;
        });
      }

      // 
      if (binding.modifiers.backup) {
        if (Array.isArray(binding.value)) {
          let len = 0;
          const maxLen = binding.value.length;
          const handleFetchImg = (originSrc) => {
            if (len < maxLen) {
              fetchImg(binding.value[len])
                .then((respSrc) => {
                  el.src = respSrc;
                })
                .catch(() => {
                  len++;
                  handleFetchImg(originSrc);
                });
            }
          };

          el.addEventListener('error', () => {
            handleFetchImg(originSrc);
          });
        }

        if (typeof binding.value === 'number') {
          let count = binding.value;

          const handleFetchImg = (originSrc) => {
            if (count > 0) {
              count--;

              fetchImg(originSrc)
                .then((respSrc) => {
                  el.src = respSrc;
                })
                .catch(() => {
                  handleFetchImg(originSrc);
                });
            }
          };

          el.addEventListener('error', () => {
            handleFetchImg(originSrc);
          });
        }
      }
    },
  });
};


const install = (app: App) => {
  doubleDirective(app);
  intDirective(app);
  integerDirective(app);
  loadDirective(app);
  disableDirective(app);
  maxDirective(app);
  minDirective(app);
  numberDirective(app);
  imgDirective(app);
};

export default {
  install,
};
