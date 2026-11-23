/* ========================================================================== */
/* Aynim - shared UI helpers                                                  */
/* ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('has-js');

  function hideLoader() {
    document.body.classList.add('is-ready');
    var loader = document.querySelector('.page-loader');
    if (!loader) return;

    loader.classList.add('is-hidden');
    window.setTimeout(function () {
      loader.remove();
    }, 450);
  }

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader, { once: true });
  }

  var toastTimer;
  function toast(message, type) {
    var oldToast = document.querySelector('.site-toast');
    if (oldToast) oldToast.remove();

    var element = document.createElement('div');
    element.className = 'site-toast' + (type === 'error' ? ' site-toast--error' : '');
    element.setAttribute('role', 'status');
    element.textContent = message;
    document.body.appendChild(element);

    window.requestAnimationFrame(function () {
      element.classList.add('is-visible');
    });

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      element.classList.remove('is-visible');
      window.setTimeout(function () { element.remove(); }, 250);
    }, 2600);
  }

  window.AynimUI = Object.freeze({ toast: toast });
})();
