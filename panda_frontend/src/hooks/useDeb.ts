/**
 * Throttle
 * @param callback cb()
 * @param duration time
 * eg: bpThrottle(() => {})
 */
export function bpThrottle(callback: (e) => void, duration: number = 70) {
  let throttleTimer;
  return (e) => {
    if (throttleTimer) return;

    throttleTimer = setTimeout(() => {
      callback(e);
      throttleTimer = null;
    }, duration);
  };
}

/**
 * Debounce
 * @param callback cb
 * @param duration 
 * eg: bpDebounce(() => {})
 *
 */
export function bpDebounce(callback: (e) => void, duration: number = 70) {
  let debounceTimer;
  return (e) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      callback(e);
      debounceTimer = null;
    }, duration);
  };
}

/**
 * debounceRef inp
 * @param value 
 * @param delay (ms)
 *
 * eg: const text = debounceRef('');
 *      <input v-model="text">
 */
export const debounceRef = (value, delay: number = 700) => {
  return customRef((track, trigger) => {
    let timer = null;

    return {
      get() {
        // track
        track();
        return value;
      },

      set(val) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          // trigger
          value = val;
          trigger();
        }, delay);
      },
    };
  });
};
