/* ==========================================================================
   Eshwari Charitable Foundation (R.) — products.js
   Ayurvedic products catalogue: data-driven product grid, category filters,
   search, accessible product-detail modal, and a clearly labelled DEMO cart.

   COMPLIANCE NOTES
   - Every product below is an editable SAMPLE PLACEHOLDER until the real
     catalogue is supplied. Replace entries in PRODUCTS with verified details
     (manufacturer, ingredients, directions, licence/batch info) only.
   - No therapeutic claims are made anywhere. Prices are intentionally
     "on request" until real prices are provided.
   - The cart is a demo enquiry cart only. No order can be placed from the
     frontend; a secure backend checkout is required for real purchases.
   ========================================================================== */
'use strict';

(function () {
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  const IMG = 'assets/images/';

  /* ----------------------------------------------------------------------
     ★ EDIT THIS CATALOGUE ★  Replace with the foundation's real products.
     price: null → shows "Price on request" (no invented prices).
     Fields marked "[To be added…]" appear in the detail modal until you
     fill them with verified manufacturer information.
     ---------------------------------------------------------------------- */
  const PRODUCTS = [
    {
      id: 'sample-01',
      name: 'Herbal Chyawanprash (Sample Entry)',
      category: 'Wellness Foods',
      desc: 'A traditional herbal fruit preserve presented as an example listing. Replace this sample with the foundation\u2019s verified product.',
      image: IMG + 'product-1.jpg',
      price: null,
      manufacturer: '[To be added — verified manufacturer information]',
      ingredients: '[To be added — verified ingredient list]',
      directions: '[To be supplied by the manufacturer]',
      batch: '[To be added — licence / batch information]'
    },
    {
      id: 'sample-02',
      name: 'Ayurvedic Hair & Body Oil (Sample Entry)',
      category: 'Wellness Oils',
      desc: 'An example listing for a traditional herbal oil. Replace with the verified product and manufacturer details.',
      image: IMG + 'product-2.jpg',
      price: null,
      manufacturer: '[To be added — verified manufacturer information]',
      ingredients: '[To be added — verified ingredient list]',
      directions: '[To be supplied by the manufacturer]',
      batch: '[To be added — licence / batch information]'
    },
    {
      id: 'sample-03',
      name: 'Forest Honey (Sample Entry)',
      category: 'Wellness Foods',
      desc: 'An example listing for naturally sourced honey. Replace with the verified product and source information.',
      image: IMG + 'product-3.jpg',
      price: null,
      manufacturer: '[To be added — verified manufacturer information]',
      ingredients: '[To be added — verified ingredient list]',
      directions: '[To be supplied by the manufacturer]',
      batch: '[To be added — licence / batch information]'
    },
    {
      id: 'sample-04',
      name: 'Tulsi Herbal Infusion (Sample Entry)',
      category: 'Herbal Teas & Blends',
      desc: 'An example listing for a caffeine-free herbal infusion. Replace with the verified product details.',
      image: IMG + 'product-4.jpg',
      price: null,
      manufacturer: '[To be added — verified manufacturer information]',
      ingredients: '[To be added — verified ingredient list]',
      directions: '[To be supplied by the manufacturer]',
      batch: '[To be added — licence / batch information]'
    },
    {
      id: 'sample-05',
      name: 'Handmade Herbal Soap (Sample Entry)',
      category: 'Personal Care',
      desc: 'An example listing for a handmade cleansing bar. Replace with the verified product and maker details.',
      image: IMG + 'product-5.jpg',
      price: null,
      manufacturer: '[To be added — verified manufacturer information]',
      ingredients: '[To be added — verified ingredient list]',
      directions: '[To be supplied by the manufacturer]',
      batch: '[To be added — licence / batch information]'
    },
    {
      id: 'sample-06',
      name: 'Herbal Wellness Drops (Sample Entry)',
      category: 'Wellness Oils',
      desc: 'An example listing for a liquid herbal preparation. Replace with verified details before publishing.',
      image: IMG + 'product-6.jpg',
      price: null,
      manufacturer: '[To be added — verified manufacturer information]',
      ingredients: '[To be added — verified ingredient list]',
      directions: '[To be supplied by the manufacturer]',
      batch: '[To be added — licence / batch information]'
    },
    {
      id: 'sample-07',
      name: 'Classical Herbal Churna (Sample Entry)',
      category: 'Herbal Teas & Blends',
      desc: 'An example listing for a powdered herbal formulation. Replace with verified details before publishing.',
      image: IMG + 'product-7.jpg',
      price: null,
      manufacturer: '[To be added — verified manufacturer information]',
      ingredients: '[To be added — verified ingredient list]',
      directions: '[To be supplied by the manufacturer]',
      batch: '[To be added — licence / batch information]'
    },
    {
      id: 'sample-08',
      name: 'Soothing Herbal Balm (Sample Entry)',
      category: 'Personal Care',
      desc: 'An example listing for a topical herbal balm. Replace with verified details before publishing.',
      image: IMG + 'product-8.jpg',
      price: null,
      manufacturer: '[To be added — verified manufacturer information]',
      ingredients: '[To be added — verified ingredient list]',
      directions: '[To be supplied by the manufacturer]',
      batch: '[To be added — licence / batch information]'
    }
  ];

  const CATEGORIES = ['All', 'Wellness Foods', 'Herbal Teas & Blends', 'Wellness Oils', 'Personal Care'];

  const filterState = { query: '', category: 'All' };

  /* Simple demo cart ( enquiry cart ) with light persistence */
  let cart = [];
  const CART_KEY = 'ecf-demo-cart-v1';
  try {
    cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    if (!Array.isArray(cart)) cart = [];
  } catch (e) { cart = []; }

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* private mode */ }
  }

  const cartCount = () => cart.reduce((n, item) => n + item.qty, 0);

  /* ------------------------------------------------------------------
     Product card rendering
     ------------------------------------------------------------------ */
  function priceHtml(p) {
    return p.price != null
      ? '<span class="amount">₹' + Number(p.price).toLocaleString('en-IN') + '</span>'
      : '<span class="amount">₹ ——</span><span class="note">Price on request</span>';
  }

  function cardHtml(p) {
    return '' +
      '<article class="prod-card reveal in-view" data-id="' + p.id + '">' +
      '  <div class="prod-card__media">' +
      '    <span class="badge-sample">Sample</span>' +
      '    <img src="' + p.image + '" alt="Illustrative placeholder image for the sample product ' + p.name.replace(/"/g, '&quot;') + '" loading="lazy" width="800" height="800">' +
      '    <span class="prod-card__cat">' + p.category + '</span>' +
      '  </div>' +
      '  <div class="prod-card__body">' +
      '    <h3>' + p.name + '</h3>' +
      '    <p class="desc">' + p.desc + '</p>' +
      '    <p class="prod-card__price">' + priceHtml(p) + '</p>' +
      '    <div class="prod-card__actions">' +
      '      <button type="button" class="btn btn--ghost btn--sm" data-details="' + p.id + '">Details</button>' +
      '      <button type="button" class="btn btn--primary btn--sm" data-add="' + p.id + '">' +
      '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1.6"/><circle cx="19" cy="21" r="1.6"/><path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L22.5 7H6"/></svg>' +
      '        Add to Cart</button>' +
      '    </div>' +
      '  </div>' +
      '</article>';
  }

  function visibleProducts() {
    const q = filterState.query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const inCat = filterState.category === 'All' || p.category === filterState.category;
      const inQuery = !q || (p.name + ' ' + p.category + ' ' + p.desc).toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }

  function renderGrid() {
    const grid = $('#shop-grid');
    if (!grid) return;
    const items = visibleProducts();
    grid.innerHTML = items.map(cardHtml).join('');
    $('#result-count').textContent = items.length + ' of ' + PRODUCTS.length + ' sample products';

    let empty = $('#shop-empty');
    if (!items.length) {
      if (!empty) {
        grid.insertAdjacentHTML('beforeend',
          '<div id="shop-empty" class="empty-state" style="grid-column:1/-1">' +
          '  <div class="es-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></div>' +
          '  <h3>No products match your search</h3>' +
          '  <p>Try a different keyword or choose another category.</p>' +
          '</div>');
      }
    } else if (empty) { empty.remove(); }
  }

  function initFilters() {
    const pills = $('#filter-pills');
    if (pills) {
      pills.innerHTML = '';
      CATEGORIES.forEach((cat) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'filter-pill' + (cat === 'All' ? ' active' : '');
        b.textContent = cat;
        b.setAttribute('aria-pressed', cat === 'All' ? 'true' : 'false');
        b.addEventListener('click', () => {
          filterState.category = cat;
          $$('.filter-pill', pills).forEach((x) => {
            const active = x === b;
            x.classList.toggle('active', active);
            x.setAttribute('aria-pressed', String(active));
          });
          renderGrid();
        });
        pills.appendChild(b);
      });
    }
    const search = $('#product-search');
    if (search) {
      let t = null;
      search.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => {
          filterState.query = search.value;
          renderGrid();
        }, 180);
      });
    }
  }

  /* ------------------------------------------------------------------
     Product detail modal
     ------------------------------------------------------------------ */
  let closeDetail = null;

  function openDetails(id) {
    const p = PRODUCTS.find((x) => x.id === id);
    const modal = $('#product-modal');
    if (!p || !modal) return;

    $('.pd-media img', modal).src = p.image;
    $('.pd-media img', modal).alt = 'Illustrative placeholder image for the sample product ' + p.name;
    $('.pd-body .cat', modal).textContent = p.category;
    $('.pd-body h3', modal).textContent = p.name;
    $('.pd-body .desc', modal).textContent = p.desc;
    $('#pd-price').innerHTML = priceHtml(p);
    $('#pd-manufacturer').textContent = p.manufacturer;
    $('#pd-ingredients').textContent = p.ingredients;
    $('#pd-directions').textContent = p.directions;
    $('#pd-batch').textContent = p.batch;

    $('#pd-qty').textContent = '1';
    $('#pd-add').setAttribute('data-id', p.id);
    $('#pd-enquire').setAttribute('data-id', p.id);

    if (window.ecfOpenOverlay) closeDetail = window.ecfOpenOverlay(modal);
  }

  function closeDetails() { if (closeDetail) { closeDetail(); closeDetail = null; } }

  function initDetailModal() {
    const modal = $('#product-modal');
    if (!modal) return;
    /* close button uses data-overlay-close (handled by the overlay manager) */
    $('#pd-qty-minus').addEventListener('click', () => {
      const el = $('#pd-qty');
      el.textContent = String(Math.max(1, parseInt(el.textContent, 10) - 1));
    });
    $('#pd-qty-plus').addEventListener('click', () => {
      const el = $('#pd-qty');
      el.textContent = String(Math.min(99, parseInt(el.textContent, 10) + 1));
    });
    $('#pd-add').addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const qty = parseInt($('#pd-qty').textContent, 10) || 1;
      addToCart(id, qty);
      closeDetails();
      if (window.ecfOpenCart) window.ecfOpenCart();
    });
    $('#pd-enquire').addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      closeDetails();
      enquiry([Object.assign({}, PRODUCTS.find((x) => x.id === id), { qty: 1 })]);
    });
  }

  /* ------------------------------------------------------------------
     Cart (demo enquiry cart — no real orders)
     ------------------------------------------------------------------ */
  function addToCart(id, qty) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    const existing = cart.find((c) => c.id === id);
    if (existing) existing.qty = Math.min(99, existing.qty + qty);
    else cart.push({ id, qty });
    saveCart();
    renderCart();
    window.ecfToast && window.ecfToast('Added to demo cart — purchasing is not yet enabled.');
  }

  function setQty(id, qty) {
    const item = cart.find((c) => c.id === id);
    if (!item) return;
    item.qty = Math.max(1, Math.min(99, qty));
    saveCart();
    renderCart();
  }

  function removeFromCart(id) {
    cart = cart.filter((c) => c.id !== id);
    saveCart();
    renderCart();
  }

  function renderCart() {
    const wrap = $('#cart-items');
    if (!wrap) return;
    const countEl = $('#cart-count');
    if (countEl) countEl.textContent = String(cartCount());

    if (!cart.length) {
      wrap.innerHTML =
        '<div class="cart-empty">' +
        '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1.6"/><circle cx="19" cy="21" r="1.6"/><path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L22.5 7H6"/></svg>' +
        '  <p><b>Your demo cart is empty.</b><br>Products shown on this page are sample placeholders — add one to preview the cart experience.</p>' +
        '</div>';
    } else {
      wrap.innerHTML = cart.map((c) => {
        const p = PRODUCTS.find((x) => x.id === c.id);
        if (!p) return '';
        return '' +
          '<div class="cart-item" data-id="' + p.id + '">' +
          '  <img src="' + p.image + '" alt="" width="74" height="74">' +
          '  <div>' +
          '    <b>' + p.name + '</b>' +
          '    <span class="ci-meta">' + p.category + ' · Sample placeholder · price on request</span>' +
          '    <div class="ci-row">' +
          '      <span class="qty-stepper">' +
          '        <button type="button" data-dec="' + p.id + '" aria-label="Decrease quantity of ' + p.name.replace(/"/g, '&quot;') + '">−</button>' +
          '        <span class="qty-val" aria-live="polite">' + c.qty + '</span>' +
          '        <button type="button" data-inc="' + p.id + '" aria-label="Increase quantity of ' + p.name.replace(/"/g, '&quot;') + '">+</button>' +
          '      </span>' +
          '      <button type="button" class="rm" data-rm="' + p.id + '">' +
          '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18m-2 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 4v6m4-6v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
          '        Remove</button>' +
          '    </div>' +
          '  </div>' +
          '</div>';
      }).join('');
    }
    $('#cart-total-line').hidden = cart.length === 0;
  }

  function initCartControls() {
    const drawer = $('#cart-drawer');
    if (!drawer) return;
    let closeFn = null;

    function openCart() {
      renderCart();
      if (window.ecfOpenOverlay && !drawer.classList.contains('open')) {
        closeFn = window.ecfOpenOverlay(drawer);
        const obs = new MutationObserver(() => {
          if (!drawer.classList.contains('open')) { closeFn = null; obs.disconnect(); }
        });
        obs.observe(drawer, { attributes: true, attributeFilter: ['class'] });
      }
    }
    window.ecfOpenCart = openCart;

    const cartOpenBtn = $('.cart-btn');
    if (cartOpenBtn) cartOpenBtn.addEventListener('click', openCart);
    const closeBtnEl = $('[data-cart-close]', drawer);
    if (closeBtnEl) closeBtnEl.addEventListener('click', () => closeFn && closeFn());
    $('#cart-clear').addEventListener('click', () => {
      cart = [];
      saveCart();
      renderCart();
    });
    $('#cart-enquire').addEventListener('click', () => {
      enquiry(cart.map((c) => Object.assign({}, PRODUCTS.find((x) => x.id === c.id), { qty: c.qty })));
    });
    $('#cart-demo-checkout').addEventListener('click', () => {
      window.ecfToast && window.ecfToast('Demo cart: a secure backend checkout is required before real orders can be placed. See README.');
    });

    /* delegate item controls */
    $('#cart-items').addEventListener('click', (e) => {
      const inc = e.target.closest('[data-inc]');
      const dec = e.target.closest('[data-dec]');
      const rm = e.target.closest('[data-rm]');
      if (inc) { const it = cart.find((c) => c.id === inc.getAttribute('data-inc')); if (it) setQty(it.id, it.qty + 1); }
      if (dec) { const it = cart.find((c) => c.id === dec.getAttribute('data-dec')); if (it) setQty(it.id, it.qty - 1); }
      if (rm) removeFromCart(rm.getAttribute('data-rm'));
    });
  }

  /* ------------------------------------------------------------------
     Enquiry — opens a demo modal (no fake emails sent)
     ------------------------------------------------------------------ */
  function enquiry(items) {
    const modal = $('#enquiry-modal');
    if (!modal || !items.length) {
      window.ecfToast && window.ecfToast('Your demo cart is empty.');
      return;
    }
    const list = $('#enquiry-list');
    list.innerHTML = items.map((p) => '<li><b>' + p.name + '</b> — ' + p.category + ' · qty ' + p.qty + '</li>').join('');
    if (window.ecfOpenOverlay) window.ecfOpenOverlay(modal);
  }

  function initEnquiryModal() {
    /* close buttons carry data-overlay-close; nothing extra needed here */
  }

  /* ------------------------------------------------------------------
     Grid click delegation (Details / Add-to-cart)
     ------------------------------------------------------------------ */
  function initGridActions() {
    $('#shop-grid').addEventListener('click', (e) => {
      const d = e.target.closest('[data-details]');
      const a = e.target.closest('[data-add]');
      if (d) openDetails(d.getAttribute('data-details'));
      if (a) addToCart(a.getAttribute('data-add'), 1);
    });
  }

  /* Deep link: products.html?p=sample-01 opens the detail modal */
  function initDeepLink() {
    const id = new URLSearchParams(location.search).get('p');
    if (id && PRODUCTS.some((p) => p.id === id)) {
      setTimeout(() => openDetails(id), 350);
    }
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  function boot() {
    if (!$('#shop-grid')) return;
    renderGrid();
    initFilters();
    initDetailModal();
    initCartControls();
    initEnquiryModal();
    initGridActions();
    initDeepLink();
    renderCart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
