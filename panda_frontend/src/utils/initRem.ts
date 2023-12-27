
(() => {
  const docEl = document.documentElement,
    resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
    recalc = function () {
      const clientWidth = docEl.clientWidth;
      if (!clientWidth) return;
      if (clientWidth >= 750) {
        docEl.style.fontSize = '1px';
      } else {
        docEl.style.fontSize = clientWidth / 750 + 'px';
      }
    };
  recalc();
  if (!document.addEventListener) return;
  window.addEventListener(resizeEvt, recalc, false);
})();

export default {};
