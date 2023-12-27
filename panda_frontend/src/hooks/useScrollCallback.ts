/**
 * ScrollThrottle
 * @param callback
 * @param duration time
 * @param el  window
 */
export const useScrollThrottle = (
  callback: () => void,
  duration: number = 100,
  el?: HTMLElement
) => {
  const target = el || window;
  let throttleTimer;

  const help = () => {
    if (throttleTimer) return;

    throttleTimer = setTimeout(() => {
      callback();
      throttleTimer = null;
    }, duration);
  };

  onMounted(() => {
    target.addEventListener('scroll', help);
  });

  onBeforeUnmount(() => {
    target.removeEventListener('scroll', help);
  });
};

/**
 * ScrollBottom
 * @param callback
 * @param duration 
 */
export const useScrollBottom = (
  callback: () => void,
  offset: number = 100,
  duration: number = 100
) => {
  const lock = ref(false);

  useScrollThrottle(() => {
    const cHeight = document.documentElement.clientHeight;
    const top = document.documentElement.scrollTop;
    const h = document.documentElement.scrollHeight;

    const bottomCondition = top + cHeight > h - offset; // offset
    if (bottomCondition && !lock.value) {
      // lock
      callback();
      lock.value = true;
    }

    if (!bottomCondition) {
      lock.value = false; // return
    }
  }, duration);
};
