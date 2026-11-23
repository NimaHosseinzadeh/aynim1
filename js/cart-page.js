/* ========================================================================== */
/* Aynim - cart page                                                          */
/* ========================================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var products = window.AYNIM_PRODUCTS || {};
    var cartPage = document.querySelector('[data-cart-page]');
    var list = document.querySelector('[data-cart-items]');
    var emptyState = document.querySelector('[data-cart-empty]');
    if (!cartPage || !list || !window.AynimCart) return;

    var countLabel = document.querySelector('[data-cart-count]');
    var subtotalLabel = document.querySelector('[data-cart-subtotal]');
    var discountLabel = document.querySelector('[data-cart-discount]');
    var discountRow = document.querySelector('[data-cart-discount-row]');
    var totalLabel = document.querySelector('[data-cart-total]');
    var checkout = document.querySelector('[data-cart-checkout]');

    function render() {
      var items = window.AynimCart.getItems();
      var validItems = items.filter(function (item) { return Boolean(products[item.id]); });
      var itemCount = validItems.reduce(function (sum, item) { return sum + item.quantity; }, 0);
      var subtotal = 0;
      var discount = 0;
      list.replaceChildren();

      validItems.forEach(function (item) {
        var product = products[item.id];
        var lineTotal = product.price * item.quantity;
        subtotal += lineTotal;
        if (product.oldPrice && product.oldPrice > product.price) {
          discount += (product.oldPrice - product.price) * item.quantity;
        }

        var row = document.createElement('li');
        row.className = 'item';
        row.dataset.id = item.id;
        row.dataset.color = item.color;
        row.dataset.size = item.size;

        var imageLink = document.createElement('a');
        imageLink.className = 'item__img';
        imageLink.href = 'product/index.html?id=' + encodeURIComponent(item.id);
        var image = document.createElement('img');
        image.src = '../assets/images/' + product.image;
        image.alt = product.title;
        image.loading = 'lazy';
        imageLink.appendChild(image);

        var info = document.createElement('div');
        info.className = 'item__info';
        var title = document.createElement('h3');
        title.className = 'item__title';
        var titleLink = document.createElement('a');
        titleLink.href = imageLink.href;
        titleLink.textContent = product.title;
        title.appendChild(titleLink);
        var options = document.createElement('p');
        options.className = 'item__opts';
        options.textContent = 'رنگ: ' + item.color + ' | سایز: ' + item.size;
        var price = document.createElement('p');
        price.className = 'item__price';
        if (product.oldPrice && product.oldPrice > product.price) {
          var old = document.createElement('del');
          old.textContent = window.AynimCart.formatNumber(product.oldPrice);
          price.appendChild(old);
        }
        var current = document.createElement('span');
        current.textContent = window.AynimCart.formatMoney(product.price);
        price.appendChild(current);
        info.append(title, options, price);

        var quantity = document.createElement('input');
        quantity.className = 'item__qty';
        quantity.type = 'number';
        quantity.min = '1';
        quantity.max = '10';
        quantity.step = '1';
        quantity.value = String(item.quantity);
        quantity.inputMode = 'numeric';
        quantity.setAttribute('aria-label', 'تعداد ' + product.title);

        var total = document.createElement('p');
        total.className = 'item__total';
        total.textContent = window.AynimCart.formatMoney(lineTotal);

        var remove = document.createElement('button');
        remove.className = 'item__remove';
        remove.type = 'button';
        remove.setAttribute('aria-label', 'حذف ' + product.title + ' از سبد');
        remove.innerHTML = '<i class="ri-delete-bin-line" aria-hidden="true"></i>';

        row.append(imageLink, info, quantity, total, remove);
        list.appendChild(row);
      });

      if (items.length !== validItems.length) {
        window.AynimCart.clear();
      }

      cartPage.classList.toggle('is-empty', validItems.length === 0);
      emptyState.hidden = validItems.length !== 0;
      if (countLabel) countLabel.textContent = window.AynimCart.formatNumber(itemCount) + ' کالا در سبد شما';
      if (subtotalLabel) subtotalLabel.textContent = window.AynimCart.formatMoney(subtotal);
      if (discountLabel) discountLabel.textContent = window.AynimCart.formatMoney(discount);
      if (discountRow) discountRow.hidden = discount === 0;
      if (totalLabel) totalLabel.textContent = window.AynimCart.formatMoney(subtotal);
      if (checkout) {
        checkout.setAttribute('aria-disabled', validItems.length === 0 ? 'true' : 'false');
        checkout.classList.toggle('is-disabled', validItems.length === 0);
      }
    }

    list.addEventListener('change', function (event) {
      var input = event.target.closest('.item__qty');
      var row = input && input.closest('.item');
      if (!row) return;
      var quantity = Math.floor(Number(input.value) || 1);
      quantity = Math.min(10, Math.max(1, quantity));
      window.AynimCart.updateItem({
        id: row.dataset.id,
        color: row.dataset.color,
        size: row.dataset.size
      }, quantity);
      render();
    });

    list.addEventListener('click', function (event) {
      var button = event.target.closest('.item__remove');
      var row = button && button.closest('.item');
      if (!row) return;
      window.AynimCart.removeItem({
        id: row.dataset.id,
        color: row.dataset.color,
        size: row.dataset.size
      });
      if (window.AynimUI) window.AynimUI.toast('محصول از سبد خرید حذف شد.');
      render();
    });

    if (checkout) {
      checkout.addEventListener('click', function (event) {
        if (checkout.getAttribute('aria-disabled') === 'true') {
          event.preventDefault();
          if (window.AynimUI) window.AynimUI.toast('ابتدا محصولی به سبد خرید اضافه کن.', 'error');
        }
      });
    }

    window.addEventListener('aynim:cart-updated', render);
    render();
  });
})();
