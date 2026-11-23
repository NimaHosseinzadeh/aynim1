/* Aynim wishlist: add/remove products from every product card and detail page. */
(function () {
  'use strict';

  var STORAGE_KEY = 'aynim-wishlist-v1';
  var products = window.AYNIM_PRODUCTS || {};
  var numberFormat = new Intl.NumberFormat('fa-IR');

  function read() {
    try {
      var stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(stored) ? stored.map(String) : [];
    } catch (error) {
      return [];
    }
  }

  function save(ids) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch (error) {}
  }

  function isSaved(id) {
    return read().indexOf(String(id)) !== -1;
  }

  function toggle(id) {
    id = String(id);
    var ids = read();
    var exists = ids.indexOf(id) !== -1;
    save(exists ? ids.filter(function (item) { return item !== id; }) : ids.concat(id));
    return !exists;
  }

  function createButton(id, detail) {
    var active = isSaved(id);
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'wishlist-toggle' + (detail ? ' wishlist-toggle--detail' : '');
    button.dataset.wishlistId = String(id);
    button.setAttribute('aria-label', active ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها');
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
    button.innerHTML = '<i class="' + (active ? 'ri-heart-fill' : 'ri-heart-line') + '"></i>';
    return button;
  }

  function getProductId(link) {
    try {
      var url = new URL(link.href, window.location.href);
      var id = url.searchParams.get('id');
      return id && products[id] ? id : null;
    } catch (error) {
      return null;
    }
  }

  function decorateCards() {
    document.querySelectorAll('a.card[href*="product/index.html"]').forEach(function (card) {
      if (card.querySelector('.wishlist-toggle')) return;
      var id = getProductId(card);
      if (id) card.appendChild(createButton(id, false));
    });
  }

  function decorateDetailButton() {
    var oldButton = document.querySelector('.buy__wish');
    if (!oldButton || oldButton.dataset.wishlistReady === 'true') return;
    var id = new URLSearchParams(window.location.search).get('id');
    if (!id || !products[id]) return;

    var button = createButton(id, true);
    button.classList.add('buy__wish');
    oldButton.replaceWith(button);
  }

  function refreshButtons() {
    document.querySelectorAll('.wishlist-toggle[data-wishlist-id]').forEach(function (button) {
      var active = isSaved(button.dataset.wishlistId);
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      button.setAttribute('aria-label', active ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها');
      button.innerHTML = '<i class="' + (active ? 'ri-heart-fill' : 'ri-heart-line') + '"></i>';
    });
  }

  function renderWishlistPage() {
    var grid = document.querySelector('[data-wishlist-grid]');
    if (!grid) return;

    grid.innerHTML = '';
    read().forEach(function (id) {
      var product = products[id];
      if (!product) return;

      var item = document.createElement('div');
      item.className = 'wish-item';
      var card = document.createElement('a');
      card.className = 'card';
      card.href = 'product/index.html?id=' + encodeURIComponent(id);

      if (product.badge) {
        var badge = document.createElement('span');
        badge.className = 'card__badge';
        badge.textContent = product.badge;
        card.appendChild(badge);
      }

      var image = document.createElement('img');
      image.className = 'card__img';
      image.src = '../assets/images/' + product.image;
      image.alt = product.title;
      image.loading = 'lazy';

      var title = document.createElement('h3');
      title.className = 'card__title';
      title.textContent = product.title;

      if (product.oldPrice) {
        var oldPrice = document.createElement('del');
        oldPrice.className = 'card__old';
        oldPrice.textContent = numberFormat.format(product.oldPrice);
        card.appendChild(oldPrice);
      }

      var price = document.createElement('p');
      price.className = 'card__price';
      price.textContent = numberFormat.format(product.price) + ' تومان';
      card.append(image, title, price, createButton(id, false));
      item.appendChild(card);
      grid.appendChild(item);
    });

    var count = document.querySelector('[data-wishlist-count]');
    var total = grid.querySelectorAll('.wish-item').length;
    if (count) count.textContent = numberFormat.format(total) + ' محصول';

    if (!total) {
      var empty = document.createElement('p');
      empty.className = 'wishlist-empty';
      empty.textContent = 'هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید.';
      grid.appendChild(empty);
    }
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('.wishlist-toggle[data-wishlist-id]');
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();
    var added = toggle(button.dataset.wishlistId);
    decorateCards();
    refreshButtons();
    renderWishlistPage();

    if (window.AynimUI && typeof window.AynimUI.toast === 'function') {
      window.AynimUI.toast(added ? 'به علاقه‌مندی‌ها اضافه شد.' : 'از علاقه‌مندی‌ها حذف شد.');
    }
  }, true);

  window.addEventListener('storage', function (event) {
    if (event.key === STORAGE_KEY) {
      decorateCards();
      decorateDetailButton();
      refreshButtons();
      renderWishlistPage();
    }
  });

  function init() {
    decorateCards();
    decorateDetailButton();
    renderWishlistPage();
    refreshButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
