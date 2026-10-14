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

  /* Reveal-on-scroll for index rows & sections */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* Keyboard nav: left/right between essays */
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'ArrowRight' && document.querySelector('[data-next]')) {
      window.location = document.querySelector('[data-next]').getAttribute('href');
    }
    if (e.key === 'ArrowLeft' && document.querySelector('[data-prev]')) {
      window.location = document.querySelector('[data-prev]').getAttribute('href');
    }
  });
})();