/* ========================================================================== */
/* Aynim - cart storage and shared cart actions                               */
/* Cart data is stored locally in this browser.                               */
/* ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'aynim-cart-v1';
  var numberFormat = new Intl.NumberFormat('fa-IR');

  function toNumber(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function readItems() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      var parsed = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed)) return [];

      return parsed.filter(function (item) {
        return item && typeof item.id === 'string'
          && typeof item.color === 'string'
          && typeof item.size === 'string'
          && Number.isFinite(Number(item.quantity));
      }).map(function (item) {
        return {
          id: item.id,
          color: item.color,
          size: item.size,
          quantity: Math.min(10, Math.max(1, Math.floor(Number(item.quantity))))
        };
      });
    } catch (error) {
      console.warn('Aynim: cart data could not be read.', error);
      return [];
    }
  }

  function getCount(items) {
    return items.reduce(function (total, item) {
      return total + item.quantity;
    }, 0);
  }

  function updateBadges(items) {
    var count = getCount(items);
    document.querySelectorAll('.cart__count').forEach(function (badge) {
      badge.textContent = numberFormat.format(count);
      badge.setAttribute('aria-label', numberFormat.format(count) + ' کالا در سبد خرید');
      badge.hidden = count === 0;
    });
  }

  function saveItems(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      updateBadges(items);
      window.dispatchEvent(new CustomEvent('aynim:cart-updated', { detail: { items: items } }));
      return true;
    } catch (error) {
      console.error('Aynim: cart data could not be saved.', error);
      if (window.AynimUI) window.AynimUI.toast('ذخیره سبد خرید در این مرورگر ممکن نشد.', 'error');
      return false;
    }
  }

  function getItems() {
    return readItems();
  }

  function addItem(selection) {
    if (!selection || !selection.id || !selection.color || !selection.size) return false;

    var items = readItems();
    var quantity = Math.min(10, Math.max(1, Math.floor(toNumber(selection.quantity, 1))));
    var existing = items.find(function (item) {
      return item.id === String(selection.id)
        && item.color === String(selection.color)
        && item.size === String(selection.size);
    });

    if (existing) {
      existing.quantity = Math.min(10, existing.quantity + quantity);
    } else {
      items.push({
        id: String(selection.id),
        color: String(selection.color),
        size: String(selection.size),
        quantity: quantity
      });
    }

    return saveItems(items);
  }

  function updateItem(selection, quantity) {
    var items = readItems();
    var item = items.find(function (entry) {
      return entry.id === String(selection.id)
        && entry.color === String(selection.color)
        && entry.size === String(selection.size);
    });
    if (!item) return false;

    item.quantity = Math.min(10, Math.max(1, Math.floor(toNumber(quantity, 1))));
    return saveItems(items);
  }

  function removeItem(selection) {
    var items = readItems().filter(function (item) {
      return !(item.id === String(selection.id)
        && item.color === String(selection.color)
        && item.size === String(selection.size));
    });
    return saveItems(items);
  }

  function clear() {
    return saveItems([]);
  }

  updateBadges(readItems());
  window.addEventListener('storage', function (event) {
    if (event.key === STORAGE_KEY) updateBadges(readItems());
  });

  window.AynimCart = Object.freeze({
    getItems: getItems,
    getCount: function () { return getCount(readItems()); },
    addItem: addItem,
    updateItem: updateItem,
    removeItem: removeItem,
    clear: clear,
    formatNumber: function (value) { return numberFormat.format(value); },
    formatMoney: function (value) { return numberFormat.format(value) + ' تومان'; }
  });
})();
