/* ========================================================================== */
/* Aynim - shared product page                                                */
/* Reads the product ID from ?id= and fills the common product template.      */
/* ========================================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var products = window.AYNIM_PRODUCTS || {};
    var params = new URLSearchParams(window.location.search);
    var productId = params.get('id');
    var product = productId ? products[productId] : null;
    var content = document.querySelector('[data-product-content]');
    var notFound = document.querySelector('[data-product-not-found]');

    if (!product) {
      if (content) content.hidden = true;
      if (notFound) notFound.hidden = false;
      document.title = 'محصول پیدا نشد | Aynim';
      return;
    }

    var $ = function (selector) { return document.querySelector(selector); };
    var numberFormat = new Intl.NumberFormat('fa-IR');

    document.title = product.title + ' | Aynim';
    $('[data-product-title]').textContent = product.title;
    $('[data-product-breadcrumb]').textContent = product.title;
    $('[data-product-code]').textContent = 'کد محصول: ' + product.code;
    $('[data-product-price]').textContent = numberFormat.format(product.price) + ' تومان';

    var image = $('[data-product-image]');
    image.src = '../../assets/images/' + product.image;
    image.alt = product.title;

    var badge = $('[data-product-badge]');
    if (product.badge) {
      badge.textContent = product.badge;
      badge.hidden = false;
    }

    var oldPrice = $('[data-product-old-price]');
    if (product.oldPrice) {
      oldPrice.textContent = numberFormat.format(product.oldPrice);
      oldPrice.hidden = false;
    }

    var categoryLink = $('[data-product-category-link]');
    categoryLink.textContent = product.category;
    categoryLink.href = product.categoryHref || '../shop.html';

    var colorsContainer = $('[data-product-colors]');
    product.colors.forEach(function (color, index) {
      var label = document.createElement('label');
      label.className = 'swatch';

      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'color';
      input.value = color.name;
      input.setAttribute('aria-label', color.name);
      input.checked = index === 0;

      var swatch = document.createElement('span');
      swatch.style.backgroundColor = color.hex;
      swatch.title = color.name;

      label.append(input, swatch);
      colorsContainer.appendChild(label);
    });

    var selectedColor = $('[data-selected-color]');
    function updateSelectedColor() {
      var checked = colorsContainer.querySelector('input[name="color"]:checked');
      selectedColor.textContent = checked ? 'رنگ انتخاب‌شده: ' + checked.value : '';
    }
    colorsContainer.addEventListener('change', updateSelectedColor);
    updateSelectedColor();

    var sizesContainer = $('[data-product-sizes]');
    product.sizes.forEach(function (size, index) {
      var label = document.createElement('label');
      label.className = 'chip';

      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'size';
      input.value = size;
      input.checked = index === 0;

      var text = document.createElement('span');
      text.textContent = size;

      label.append(input, text);
      sizesContainer.appendChild(label);
    });

    var specsContainer = $('[data-product-specs]');
    product.specs.forEach(function (spec) {
      var row = document.createElement('div');
      var term = document.createElement('dt');
      var description = document.createElement('dd');
      term.textContent = spec.label;
      description.textContent = spec.value;
      row.append(term, description);
      specsContainer.appendChild(row);
    });
    $('[data-product-description]').textContent = product.description;

    var relatedContainer = $('[data-related-products]');
    product.related.forEach(function (relatedId) {
      var relatedProduct = products[relatedId];
      if (!relatedProduct) return;

      var card = document.createElement('a');
      card.className = 'card';
      card.href = 'index.html?id=' + encodeURIComponent(relatedProduct.id);

      var cardBadge = document.createElement('span');
      cardBadge.className = 'card__badge';
      cardBadge.textContent = relatedProduct.badge || 'محصول';

      var cardImage = document.createElement('img');
      cardImage.className = 'card__img';
      cardImage.src = '../../assets/images/' + relatedProduct.image;
      cardImage.alt = relatedProduct.title;
      cardImage.loading = 'lazy';

      var cardTitle = document.createElement('h3');
      cardTitle.className = 'card__title';
      cardTitle.textContent = relatedProduct.title;

      var cardPrice = document.createElement('p');
      cardPrice.className = 'card__price';
      cardPrice.textContent = numberFormat.format(relatedProduct.price) + ' تومان';

      card.append(cardBadge, cardImage, cardTitle, cardPrice);
      relatedContainer.appendChild(card);
    });

    var form = $('[data-product-form]');
    var quantityInput = $('[data-product-quantity]');
    quantityInput.addEventListener('change', function () {
      var quantity = Math.floor(Number(quantityInput.value) || 1);
      quantityInput.value = String(Math.min(10, Math.max(1, quantity)));
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var colorInput = form.querySelector('input[name="color"]:checked');
      var sizeInput = form.querySelector('input[name="size"]:checked');
      var quantity = Math.floor(Number(quantityInput.value) || 1);
      quantity = Math.min(10, Math.max(1, quantity));
      quantityInput.value = String(quantity);

      if (!colorInput || !sizeInput) {
        if (window.AynimUI) window.AynimUI.toast('لطفاً رنگ و سایز محصول را انتخاب کن.', 'error');
        return;
      }

      var added = window.AynimCart && window.AynimCart.addItem({
        id: product.id,
        color: colorInput.value,
        size: sizeInput.value,
        quantity: quantity
      });

      if (added && window.AynimUI) {
        window.AynimUI.toast('محصول به سبد خرید اضافه شد.');
      }
    });
  });
})();
