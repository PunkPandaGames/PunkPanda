import { bpFixed } from 'bp-math';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Ref } from 'vue';
dayjs.extend(duration); // 安到 dayjs

type ICountdownType = 'Y' | 'M' | 'D' | 'h' | 'm' | 's';
/**
 * get count down
 * @param targetTime ms
 * @param {String} format 'Y' | 'M' | 'D' | 'h' | 'm' | 's'
 * @returns
 */
export function getCountDown(targetStamp: number | string, format: ICountdownType) {
  function _toTwo(num) {
    if (!num) return '00';
    return String(num).length < 2 ? '0' + num : num;
  }
  const now: any = dayjs(); // now
  const diffTime = dayjs.duration(+targetStamp - now); // difftime
  // const diffTime = dayjs.duration(NaN - now);

  if (format === 'M') {
    // Month
    const months = _toTwo(Math.floor(diffTime.asMonths()));
    const days = _toTwo(diffTime.days());
    const hours = _toTwo(bpFixed(diffTime.hours()));
    const minutes = _toTwo(diffTime.minutes());
    const seconds = _toTwo(diffTime.seconds());

    return {
      months,
      days,
      hours,
      minutes,
      seconds
    };
  } else if (format === 'D') {
    // Day
    const days = _toTwo(Math.floor(diffTime.asDays()));
    const hours = _toTwo(bpFixed(diffTime.hours()));
    const minutes = _toTwo(diffTime.minutes());
    const seconds = _toTwo(diffTime.seconds());

    return {
      days,
      hours,
      minutes,
      seconds
    };
  } else if (format === 'h') {
    // Hour
    const hours = _toTwo(Math.floor(diffTime.asHours()));
    const minutes = _toTwo(diffTime.minutes());
    const seconds = _toTwo(diffTime.seconds());

    return {
      hours,
      minutes,
      seconds
    };
  } else if (format === 'm') {
    // Minus
    const minutes = _toTwo(Math.floor(diffTime.asMinutes()));
    const seconds = _toTwo(diffTime.seconds());

    return {
      minutes,
      seconds
    };
  } else if (format === 's') {
    // sconde
    const seconds = _toTwo(Math.floor(diffTime.asSeconds()));

    return {
      seconds
    };
  } else {
    // year
    const year = diffTime.years(); //years
    const month = diffTime.months(); //months
    const days = diffTime.days(); //days
    const hours = diffTime.hours(); //hours
    const minutes = diffTime.minutes(); //min
    const seconds = diffTime.seconds(); //sconde
    
    return {
      year,
      month,
      days,
      hours,
      minutes,
      seconds
    };
  }
}

/**
 * update
 */
export function useUpdate(cb: () => void) {
  let requestTimer = null;

  const updateCountdown = timestamp => {
    requestTimer = requestAnimationFrame(updateCountdown);
    cb();
  };

  const cancel = () => {
    cancelAnimationFrame(requestTimer);
  };

  onMounted(() => {
    requestTimer = requestAnimationFrame(updateCountdown);
  });

  onUnmounted(() => {
    cancelAnimationFrame(requestTimer);
  });

  return {
    cancel
  };
}

/**
 * count down
 */
export function useCountdown(
  startTime: Ref<number | string>,
  endTime: Ref<number | string>,
  type: ICountdownType,
  extra?: { onFinished: () => void }
) {
  const countdownTime = ref(null);
  const lock = ref(true);
  const nowTime = ref(Date.now());

  // couting status
  const coutingStatus = computed<'notStart' | 'expired' | 'counting'>(() => {
    // not start
    if (+startTime.value > nowTime.value) {
      return 'notStart';
    }
    // end
    else if (+endTime.value <= nowTime.value) {
      return 'expired';
    } else {
      return 'counting';
    }
  });

  /**
   * unlock
   */
  const unLock = () => {
    lock.value = false;
  };
  watch(
    endTime,
    (val) => {
      if (+val) {
        unLock();
      }
    },
    { immediate: true }
  );

  const { cancel } = useUpdate(() => {
    if (lock.value) return;
    nowTime.value = Date.now();

    // not start
    if (+startTime.value > Date.now()) {
      countdownTime.value = getCountDown(startTime.value, type);
    }

    // end
    else if (+endTime.value <= Date.now()) {
      extra?.onFinished?.();
      // cancel();
    } else {
      countdownTime.value = getCountDown(endTime.value, type);
    }
  });

  return {
    countdownTime,
    coutingStatus
  };
}
