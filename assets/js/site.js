/* Marginal Note — minimal interactions, no dependencies */
(function () {
  'use strict';

  /* Reading progress bar */
  var progress = document.querySelector('.progress');
  if (progress) {
    var onScroll = function () {
      var h = document.documentElement;
      var total = h.scrollHeight - h.clientHeight;
      var pct = total > 0 ? (h.scrollTop / total) * 100 : 0;
      progress.style.width = pct + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Keyboard nav: left/right between essays */
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'ArrowRight' && document.querySelector('[data-next]')) {
      window.location = document.querySelector('[data-next]').getAttribute('href');
    }
  });
})();