/* ═══════════════════════════════════════════════════════════
   STYLEVERSE — LUXURY FASHION PLATFORM APP.JS
   Full Interactivity: Cart, AI, Try-On, Trends, Billing
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── State ─── */
const state = {
  cart: [],
  wishlist: [],
  currentSlide: 0,
  totalSlides: 2,
  slideInterval: null,
  tryonActive: false,
  cameraStream: null,
  selectedTryonItem: 'Celestial Silk Gown',
  paymentMethod: 'card',
  couponApplied: false,
};

/* ─── Product Data ─── */
const products = {
  'prod-001': {
    name: 'Celestial Silk Gown',
    designer: 'STYLEVERSE COUTURE',
    price: '₹48,500',
    priceNum: 48500,
    img: 'assets/collection_white_dress.png',
    desc: 'A masterpiece in ivory silk charmeuse, this gown drapes effortlessly with a hand-finished hem and subtle gold thread detailing. The embodiment of modern couture.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  'prod-002': {
    name: 'Midnight Power Blazer',
    designer: 'ATELIER NOIR',
    price: '₹32,000',
    priceNum: 32000,
    img: 'assets/collection_black_blazer.png',
    desc: 'Precision-cut from double-faced wool, this blazer redefines executive dressing. Featuring a structured shoulder and minimalist lapel, it commands every room.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  'prod-003': {
    name: 'Ivory Structured Tote',
    designer: 'MAISON LUXE',
    price: '₹85,000',
    priceNum: 85000,
    img: 'assets/collection_handbag.png',
    desc: 'Crafted from full-grain Italian leather with solid brass hardware, this tote is the ultimate status accessory — equally at home in the boardroom and at the gala.',
    sizes: ['One Size'],
  },
  'prod-004': {
    name: 'Luminary Evening Gown',
    designer: 'COUTURE BLANCHE',
    price: '₹1,25,000',
    priceNum: 125000,
    img: 'assets/hero_fashion_banner.png',
    desc: 'A limited-edition couture gown sculpted from pure organza and hand-embroidered with micro-crystal details. For the moments that define a lifetime.',
    sizes: ['XS', 'S', 'M', 'L'],
  },
  'prod-005': {
    name: 'Obsidian Power Set',
    designer: 'MONOCHROME ATELIER',
    price: '₹42,500',
    priceNum: 42500,
    img: 'assets/collection_black_blazer.png',
    desc: 'A coordinated blazer and trouser set in matte obsidian crepe. Ultra-modern, sharply tailored, and infinitely versatile.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  'prod-006': {
    name: 'Gold Chain Micro Bag',
    designer: 'GILDED HOUSE',
    price: '₹62,000',
    priceNum: 62000,
    img: 'assets/collection_handbag.png',
    desc: 'The most coveted micro-bag of the season, with hand-set gold chain links and a satin interior. A collector\'s piece.',
    sizes: ['One Size'],
  },
};

/* ═══════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroSlider();
  initScrollReveal();
  initFilterTabs();
  initStatCounters();
  initCharts();
  initTrendBars();
  initCategoryBars();
  initSearchOverlay();
  initAIInput();
  drawRadarChart();
  initCartFromStorage();
  updateCartUI();
});

/* ═══════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveNavLink();
  });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  document.getElementById('cartToggle').addEventListener('click', toggleCart);
  document.getElementById('profileToggle').addEventListener('click', toggleProfile);
  document.getElementById('searchToggle').addEventListener('click', toggleSearch);
}

function updateActiveNavLink() {
  const sections = ['home', 'collections', 'ai-stylist', 'virtual-tryon', 'trends', 'loyalty'];
  const links = document.querySelectorAll('.nav-link');
  let current = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 120) current = id;
  });
  links.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

/* ═══════════════════════════════════════════════════════════
   SEARCH OVERLAY
═══════════════════════════════════════════════════════════ */
function initSearchOverlay() {
  const overlay = document.getElementById('searchOverlay');
  document.getElementById('searchClose').addEventListener('click', () => {
    overlay.classList.remove('active');
  });
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay.classList.remove('active');
  });
  document.querySelectorAll('.suggestion-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.getElementById('searchInput').value = tag.textContent;
      showToast(`Searching for "${tag.textContent}"`, 'info');
      setTimeout(() => overlay.classList.remove('active'), 800);
    });
  });
}

function toggleSearch() {
  const overlay = document.getElementById('searchOverlay');
  overlay.classList.toggle('active');
  if (overlay.classList.contains('active')) {
    setTimeout(() => document.getElementById('searchInput').focus(), 350);
  }
}

/* ═══════════════════════════════════════════════════════════
   HERO SLIDER
═══════════════════════════════════════════════════════════ */
function initHeroSlider() {
  state.slideInterval = setInterval(nextSlide, 5500);
}

function nextSlide() {
  goToSlide((state.currentSlide + 1) % state.totalSlides);
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  slides[state.currentSlide].classList.remove('active');
  dots[state.currentSlide].classList.remove('active');
  state.currentSlide = index;
  slides[state.currentSlide].classList.add('active');
  dots[state.currentSlide].classList.add('active');
  // Reset slide interval
  clearInterval(state.slideInterval);
  state.slideInterval = setInterval(nextSlide, 5500);
}

/* ═══════════════════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.product-card, .trend-card, .tier-card, .p-stat-card, .ai-feature-item, .dna-attr, .reco-item, .reward-item'
  );
  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(el => observer.observe(el));

  // Animate trend/category bars when visible
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateBars(entry.target);
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.trend-card, .chart-panel').forEach(el => barObserver.observe(el));
}

function animateBars(container) {
  container.querySelectorAll('[data-width]').forEach(bar => {
    setTimeout(() => {
      bar.style.width = bar.dataset.width + '%';
    }, 200);
  });
}

/* ═══════════════════════════════════════════════════════════
   STAT COUNTERS
═══════════════════════════════════════════════════════════ */
function initStatCounters() {
  const counters = document.querySelectorAll('[data-target]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current).toLocaleString();
    if (current >= target) clearInterval(timer);
  }, 16);
}

/* ═══════════════════════════════════════════════════════════
   FILTER TABS
═══════════════════════════════════════════════════════════ */
function initFilterTabs() {
  const tabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.product-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;

      cards.forEach(card => {
        const cats = card.dataset.category || '';
        const show = filter === 'all' || cats.includes(filter);
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          card.classList.toggle('hidden', !show);
          if (show) {
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
              card.style.transition = 'all 0.4s ease';
            }, 50);
          }
        }, 200);
      });
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   CART MANAGEMENT
═══════════════════════════════════════════════════════════ */
function addToCart(id, name, price) {
  const existing = state.cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    const prod = products[id];
    state.cart.push({
      id, name, price,
      img: prod ? prod.img : 'assets/collection_white_dress.png',
      qty: 1,
    });
  }
  saveCartToStorage();
  updateCartUI();
  animateCartButton();
  showToast(`<i class="fas fa-check"></i> Added to your wardrobe — ${name}`, 'success');
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveCartToStorage();
  updateCartUI();
  renderCartSidebar();
}

function updateCartUI() {
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  const countEl = document.getElementById('cartCount');
  const itemCountEl = document.getElementById('cartItemCount');

  countEl.textContent = count;
  countEl.classList.toggle('visible', count > 0);
  if (itemCountEl) itemCountEl.textContent = `(${count})`;

  renderCartSidebar();
  renderBillingCart();
}

function renderCartSidebar() {
  const container = document.getElementById('cartSidebarItems');
  const footer = document.getElementById('cartSidebarFooter');
  const empty = document.getElementById('cartEmpty');
  const totalEl = document.getElementById('cartTotal');

  if (state.cart.length === 0) {
    container.innerHTML = '';
    container.appendChild(createEmptyCartEl());
    footer.style.display = 'none';
    return;
  }

  let html = '';
  let total = 0;
  state.cart.forEach(item => {
    const numPrice = parseInt(item.price.replace(/[^0-9]/g, ''));
    total += numPrice * item.qty;
    html += `
      <div class="cart-line-item" id="cart-${item.id}">
        <img src="${item.img}" alt="${item.name}" class="cart-line-img" />
        <div class="cart-line-info">
          <p class="cart-line-name">${item.name}</p>
          <p class="cart-line-price">${item.price} × ${item.qty}</p>
        </div>
        <button class="cart-line-remove" onclick="removeFromCart('${item.id}')" title="Remove">
          <i class="fas fa-times"></i>
        </button>
      </div>`;
  });

  container.innerHTML = html;
  footer.style.display = 'block';
  totalEl.textContent = '₹' + total.toLocaleString('en-IN');
}

function createEmptyCartEl() {
  const div = document.createElement('div');
  div.className = 'cart-sidebar-empty';
  div.innerHTML = '<i class="fas fa-shopping-bag"></i><p>Your wardrobe awaits</p>';
  return div;
}

function renderBillingCart() {
  const container = document.getElementById('billingCartItems');
  const emptyEl = document.getElementById('billingEmpty');
  const summaryEl = document.getElementById('cartSummary');
  if (!container) return;

  if (state.cart.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (summaryEl) summaryEl.style.display = 'none';
    container.innerHTML = '';
    if (emptyEl) container.appendChild(emptyEl);
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (summaryEl) summaryEl.style.display = 'flex';

  let subtotal = 0;
  let html = '';
  state.cart.forEach(item => {
    const numPrice = parseInt(item.price.replace(/[^0-9]/g, ''));
    subtotal += numPrice * item.qty;
    html += `
      <div class="cart-line-item">
        <img src="${item.img}" alt="${item.name}" class="cart-line-img" />
        <div class="cart-line-info">
          <p class="cart-line-name">${item.name}</p>
          <p class="cart-line-price">${item.price} × ${item.qty}</p>
        </div>
        <button class="cart-line-remove" onclick="removeFromCart('${item.id}')" title="Remove">
          <i class="fas fa-times"></i>
        </button>
      </div>`;
  });

  container.innerHTML = html;
  if (emptyEl) container.appendChild(emptyEl);

  const discount = state.couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const subEl = document.getElementById('summarySubtotal');
  const discEl = document.getElementById('summaryDiscount');
  const totEl = document.getElementById('summaryTotal');
  if (subEl) subEl.textContent = '₹' + subtotal.toLocaleString('en-IN');
  if (discEl) discEl.textContent = '-₹' + discount.toLocaleString('en-IN');
  if (totEl) totEl.textContent = '₹' + total.toLocaleString('en-IN');
}

function animateCartButton() {
  const btn = document.getElementById('cartToggle');
  btn.style.transform = 'scale(1.3)';
  setTimeout(() => btn.style.transform = 'scale(1)', 350);
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
  document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

function saveCartToStorage() {
  try { localStorage.setItem('sv_cart', JSON.stringify(state.cart)); } catch(e) {}
}

function initCartFromStorage() {
  try {
    const saved = localStorage.getItem('sv_cart');
    if (saved) state.cart = JSON.parse(saved);
  } catch(e) { state.cart = []; }
}

/* ═══════════════════════════════════════════════════════════
   PROFILE SIDEBAR
═══════════════════════════════════════════════════════════ */
function toggleProfile() {
  const sidebar = document.getElementById('profileSidebar');
  const overlay = document.getElementById('profileOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
  document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

/* ═══════════════════════════════════════════════════════════
   WISHLIST
═══════════════════════════════════════════════════════════ */
function toggleWishlist(btn, id) {
  const icon = btn.querySelector('i');
  const isWishlisted = btn.classList.contains('wishlisted');

  if (isWishlisted) {
    btn.classList.remove('wishlisted');
    icon.className = 'far fa-heart';
    state.wishlist = state.wishlist.filter(i => i !== id);
    showToast('Removed from wishlist');
  } else {
    btn.classList.add('wishlisted');
    icon.className = 'fas fa-heart';
    if (!state.wishlist.includes(id)) state.wishlist.push(id);
    showToast('<i class="fas fa-heart"></i> Added to your wishlist!', 'success');
  }
}

/* ═══════════════════════════════════════════════════════════
   QUICK VIEW MODAL
═══════════════════════════════════════════════════════════ */
function quickView(id) {
  const prod = products[id];
  if (!prod) return;
  const modal = document.getElementById('quickViewModal');
  const grid = document.getElementById('qvGrid');

  grid.innerHTML = `
    <img src="${prod.img}" alt="${prod.name}" class="qv-img" />
    <div class="qv-info">
      <p class="qv-designer">${prod.designer}</p>
      <h3 class="qv-name">${prod.name}</h3>
      <p class="qv-price">${prod.price}</p>
      <p class="qv-desc">${prod.desc}</p>
      <div>
        <p style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mid-gray);margin-bottom:8px;">Select Size</p>
        <div class="qv-sizes">
          ${prod.sizes.map((s, i) => `<button class="qv-size-btn ${i===1?'selected':''}" onclick="selectSize(this)">${s}</button>`).join('')}
        </div>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
        <button class="btn-primary" onclick="addToCart('${id}','${prod.name}','${prod.price}');closeQuickView(null)">
          <i class="fas fa-shopping-bag"></i> Add to Cart
        </button>
        <button class="btn-outline" onclick="openTryon()">
          <i class="fas fa-camera"></i> Try-On
        </button>
      </div>
    </div>`;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeQuickView(e) {
  if (e && e.target !== document.getElementById('quickViewModal')) return;
  document.getElementById('quickViewModal').classList.remove('active');
  document.body.style.overflow = '';
}

function selectSize(btn) {
  btn.closest('.qv-sizes').querySelectorAll('.qv-size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

/* ═══════════════════════════════════════════════════════════
   VIRTUAL TRY-ON
═══════════════════════════════════════════════════════════ */
function openTryon() {
  scrollToSection('virtual-tryon');
}

async function startCamera() {
  const placeholder = document.getElementById('tryonPlaceholder');
  const video = document.getElementById('tryonVideo');
  const overlay = document.getElementById('tryonActiveOverlay');
  const captureBtn = document.getElementById('captureBtn');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    state.cameraStream = stream;
    video.srcObject = stream;
    placeholder.style.display = 'none';
    video.style.display = 'block';
    overlay.style.display = 'block';
    captureBtn.style.display = 'flex';
    state.tryonActive = true;
    updateTryonLabel();
    showToast('<i class="fas fa-camera"></i> Camera activated — Try on your looks!', 'success');
  } catch (err) {
    // Camera not available — simulate AR experience
    simulateTryon(placeholder, overlay, captureBtn);
  }
}

function simulateTryon(placeholder, overlay, captureBtn) {
  placeholder.innerHTML = `
    <div class="tryon-icon" style="background:linear-gradient(135deg,#fffbee,#fff3cc)">
      <i class="fas fa-magic" style="color:var(--gold)"></i>
    </div>
    <h3>AR Preview Active</h3>
    <p>Virtual try-on is simulating the outfit overlay on your profile.</p>
    <div style="margin-top:20px;padding:20px;background:var(--light-gray);border-radius:var(--radius-md);position:relative;overflow:hidden;min-height:200px;">
      <img src="assets/collection_white_dress.png" alt="Try-On" id="simulatedImg"
        style="width:100%;max-height:200px;object-fit:contain;border-radius:8px;transition:all 0.5s ease;" />
      <div class="ar-scan-line"></div>
    </div>`;
  overlay.style.display = 'block';
  if (captureBtn) captureBtn.style.display = 'flex';
  state.tryonActive = true;
  updateTryonLabel();
  showToast('<i class="fas fa-magic"></i> AR Preview activated!', 'success');
}

function uploadTryonPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const placeholder = document.getElementById('tryonPlaceholder');
    const overlay = document.getElementById('tryonActiveOverlay');
    const captureBtn = document.getElementById('captureBtn');
    placeholder.innerHTML = `
      <div style="position:relative;width:100%;text-align:center;">
        <img src="${e.target.result}" alt="Your Photo"
          style="max-width:100%;max-height:400px;object-fit:contain;border-radius:var(--radius-md);display:block;margin:0 auto;" />
        <div class="ar-scan-line"></div>
        <div style="position:absolute;top:12px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);color:#fff;padding:6px 16px;border-radius:50px;font-size:12px;font-weight:700;">
          Virtual Try-On Active
        </div>
      </div>`;
    overlay.style.display = 'block';
    if (captureBtn) captureBtn.style.display = 'flex';
    state.tryonActive = true;
    updateTryonLabel();
    showToast('<i class="fas fa-check"></i> Photo uploaded — Try-On active!', 'success');
  };
  reader.readAsDataURL(file);
}

function selectTryonItem(el, name) {
  document.querySelectorAll('.tryon-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  state.selectedTryonItem = name;
  updateTryonLabel();

  const simImg = document.getElementById('simulatedImg');
  if (simImg) {
    const imgMap = {
      'Celestial Silk Gown': 'assets/collection_white_dress.png',
      'Midnight Power Blazer': 'assets/collection_black_blazer.png',
      'Ivory Structured Tote': 'assets/collection_handbag.png',
      'Luminary Evening Gown': 'assets/hero_fashion_banner.png',
    };
    simImg.style.opacity = '0';
    setTimeout(() => {
      simImg.src = imgMap[name] || 'assets/collection_white_dress.png';
      simImg.style.opacity = '1';
    }, 300);
  }

  showToast(`Trying on: ${name}`);
}

function updateTryonLabel() {
  const label = document.getElementById('tryonOutfitLabel');
  if (label) label.textContent = state.selectedTryonItem;
}

function selectSkin(btn) {
  document.querySelectorAll('.skin-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  showToast('Skin tone updated for Try-On');
}

function captureSnapshot() {
  showToast('<i class="fas fa-camera"></i> Look captured & saved to your Style Profile!', 'success');
  if (state.cameraStream) {
    const canvas = document.getElementById('tryonCanvas');
    const video = document.getElementById('tryonVideo');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
  }
}

/* ═══════════════════════════════════════════════════════════
   AI STYLIST
═══════════════════════════════════════════════════════════ */
const aiResponses = {
  wedding: [
    "For a wedding, I'd recommend the Luminary Evening Gown — it's otherworldly in hand-embroidered organza. Pair with the Gold Chain Micro Bag and pearl drop earrings for a complete look. ✨",
    "A wedding calls for the Celestial Silk Gown — fluid, ethereal and unmistakably luxurious. I'll add it to your recommendations.",
  ],
  office: [
    "The Midnight Power Blazer is your boardroom armor. Paired with tailored trousers and the Ivory Structured Tote, you'll command any room. 💼",
    "For office style, I recommend the Obsidian Power Set — sharp, structured, and effortlessly authoritative.",
  ],
  party: [
    "A night out demands the Gold Chain Micro Bag and a sleek co-ord set. Think metallic accents and structured silhouettes. 🥂",
    "Party season calls for something bold. The Luminary Evening Gown in ivory with gold accessories will make you unforgettable.",
  ],
  casual: [
    "Quiet luxury for the weekend — a cashmere wrap layered over a silk slip dress with the Ivory Structured Tote. Effortless sophistication. ☀️",
    "Casual chic means relaxed tailoring with luxe fabrics. A linen blazer, straight-leg trousers and clean white sneakers.",
  ],
  default: [
    "That's a wonderful choice! Let me curate the perfect pieces for you. Based on your Style DNA, I'm seeing: the Celestial Silk Gown, Midnight Power Blazer, and the Ivory Structured Tote as top matches. ✦",
    "Based on your style profile, I've identified 12 pieces that perfectly align with your aesthetic. Shall I show you the top recommendations?",
    "Your style score of 94 means you have exceptional taste. I'm analyzing current runway trends against your profile now...",
    "I love this direction! Your color palette of ivory, black and gold opens up so many possibilities. Let me build the perfect look. 🎨",
  ],
};

function getAIResponse(message) {
  const m = message.toLowerCase();
  if (m.includes('wedding') || m.includes('bride') || m.includes('bridal')) return getRandom(aiResponses.wedding);
  if (m.includes('office') || m.includes('work') || m.includes('business') || m.includes('meeting')) return getRandom(aiResponses.office);
  if (m.includes('party') || m.includes('night') || m.includes('club') || m.includes('date')) return getRandom(aiResponses.party);
  if (m.includes('casual') || m.includes('weekend') || m.includes('relaxed')) return getRandom(aiResponses.casual);
  return getRandom(aiResponses.default);
}

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function initAIInput() {
  const input = document.getElementById('aiInput');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendAIMessage();
    });
  }
}

function sendAIMessage() {
  const input = document.getElementById('aiInput');
  const chatArea = document.getElementById('aiChatArea');
  const message = input.value.trim();
  if (!message) return;

  // User message
  const userDiv = document.createElement('div');
  userDiv.className = 'ai-message user-message';
  userDiv.innerHTML = `<div class="user-bubble">${escapeHtml(message)}</div>`;
  chatArea.appendChild(userDiv);
  input.value = '';

  // Typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'ai-message';
  typingDiv.innerHTML = `<div class="ai-bubble" style="display:flex;gap:6px;align-items:center;padding:14px 18px;">
    <span style="width:7px;height:7px;background:rgba(255,255,255,0.5);border-radius:50%;animation:blink 1.2s ease infinite;"></span>
    <span style="width:7px;height:7px;background:rgba(255,255,255,0.5);border-radius:50%;animation:blink 1.2s ease 0.4s infinite;"></span>
    <span style="width:7px;height:7px;background:rgba(255,255,255,0.5);border-radius:50%;animation:blink 1.2s ease 0.8s infinite;"></span>
  </div>`;
  chatArea.appendChild(typingDiv);
  chatArea.scrollTop = chatArea.scrollHeight;

  setTimeout(() => {
    chatArea.removeChild(typingDiv);
    const aiDiv = document.createElement('div');
    aiDiv.className = 'ai-message';
    aiDiv.innerHTML = `<div class="ai-bubble">${getAIResponse(message)}</div>`;
    chatArea.appendChild(aiDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
  }, 1400);
}

function sendQuickReply(text) {
  const input = document.getElementById('aiInput');
  input.value = text;
  sendAIMessage();
}

/* ── AI Stylist Modal ── */
function openAIStylist() {
  document.getElementById('aiStylistModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAIStylist(e) {
  if (e && e.target !== document.getElementById('aiStylistModal')) return;
  document.getElementById('aiStylistModal').classList.remove('active');
  document.body.style.overflow = '';
}

const aiRecoData = {
  'Work Looks': [
    { name: 'Midnight Power Blazer', price: '₹32,000', img: 'assets/collection_black_blazer.png', id: 'prod-002' },
    { name: 'Ivory Structured Tote', price: '₹85,000', img: 'assets/collection_handbag.png', id: 'prod-003' },
    { name: 'Obsidian Power Set', price: '₹42,500', img: 'assets/collection_black_blazer.png', id: 'prod-005' },
  ],
  'Date Night': [
    { name: 'Celestial Silk Gown', price: '₹48,500', img: 'assets/collection_white_dress.png', id: 'prod-001' },
    { name: 'Gold Chain Micro Bag', price: '₹62,000', img: 'assets/collection_handbag.png', id: 'prod-006' },
    { name: 'Luminary Evening Gown', price: '₹1,25,000', img: 'assets/hero_fashion_banner.png', id: 'prod-004' },
  ],
  'Casual Chic': [
    { name: 'Obsidian Power Set', price: '₹42,500', img: 'assets/collection_black_blazer.png', id: 'prod-005' },
    { name: 'Ivory Structured Tote', price: '₹85,000', img: 'assets/collection_handbag.png', id: 'prod-003' },
    { name: 'Celestial Silk Gown', price: '₹48,500', img: 'assets/collection_white_dress.png', id: 'prod-001' },
  ],
};

function selectQuizOpt(el, choice) {
  document.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');

  const resultsEl = document.getElementById('aiRecoResults');
  const gridEl = document.getElementById('aiRecoGrid');
  const items = aiRecoData[choice] || aiRecoData['Work Looks'];

  gridEl.innerHTML = items.map(item => `
    <div class="ai-reco-card" onclick="addToCart('${item.id}','${item.name}','${item.price}');closeAIStylist(null)">
      <img src="${item.img}" alt="${item.name}" />
      <div class="ai-reco-card-info">
        <p class="ai-reco-card-name">${item.name}</p>
        <p class="ai-reco-card-price">${item.price}</p>
      </div>
    </div>`).join('');

  resultsEl.style.display = 'block';
  setTimeout(() => resultsEl.style.opacity = '1', 50);
}

/* ═══════════════════════════════════════════════════════════
   TREND BARS & CATEGORY BARS
═══════════════════════════════════════════════════════════ */
function initTrendBars() {
  // Handled by scroll observer animateBars()
}

function initCategoryBars() {
  // Handled by scroll observer animateBars()
}

/* ═══════════════════════════════════════════════════════════
   CHARTS (Canvas-based)
═══════════════════════════════════════════════════════════ */
function initCharts() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        drawSalesChart();
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const canvas = document.getElementById('salesCanvas');
  if (canvas) obs.observe(canvas);
}

function drawSalesChart() {
  const canvas = document.getElementById('salesCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 500;
  const H = 200;
  canvas.width = W;
  canvas.height = H;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const actual = [42, 58, 51, 74, 68, 85, 79, 92];
  const forecast = [45, 55, 60, 70, 75, 82, 88, 97];

  const padL = 40, padR = 20, padT = 20, padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const max = 110;

  function xPos(i) { return padL + (i / (months.length - 1)) * chartW; }
  function yPos(v) { return padT + (1 - v / max) * chartH; }

  // Grid lines
  ctx.strokeStyle = '#f0ede9';
  ctx.lineWidth = 1;
  [0, 25, 50, 75, 100].forEach(v => {
    const y = yPos(v);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
    ctx.stroke();
    ctx.fillStyle = '#9e9a97';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(v, 4, y + 4);
  });

  // Draw line function
  function drawLine(data, color, dashed = false) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    if (dashed) ctx.setLineDash([6, 4]);
    else ctx.setLineDash([]);
    data.forEach((v, i) => {
      i === 0 ? ctx.moveTo(xPos(i), yPos(v)) : ctx.lineTo(xPos(i), yPos(v));
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Dots
    data.forEach((v, i) => {
      ctx.beginPath();
      ctx.arc(xPos(i), yPos(v), 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(xPos(i), yPos(v), 2, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    });
  }

  drawLine(actual, '#111111');
  drawLine(forecast, '#c9a227', true);

  // Month labels
  ctx.fillStyle = '#9e9a97';
  ctx.font = '10px Inter, sans-serif';
  ctx.textAlign = 'center';
  months.forEach((m, i) => ctx.fillText(m, xPos(i), H - 10));
}

/* ═══════════════════════════════════════════════════════════
   RADAR CHART (Style DNA)
═══════════════════════════════════════════════════════════ */
function drawRadarChart() {
  const canvas = document.getElementById('radarCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 200, H = 200;
  const cx = W / 2, cy = H / 2, R = 75;
  const labels = ['Elegance', 'Bold', 'Minimal', 'Trend', 'Classic', 'Edge'];
  const values = [0.95, 0.6, 0.88, 0.78, 0.82, 0.45];
  const n = labels.length;

  function point(angle, r) {
    return {
      x: cx + r * Math.cos(angle - Math.PI / 2),
      y: cy + r * Math.sin(angle - Math.PI / 2),
    };
  }

  // Grid rings
  [0.25, 0.5, 0.75, 1].forEach(frac => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2;
      const p = point(angle, R * frac);
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.strokeStyle = '#e8e4df';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Spokes
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2;
    const p = point(angle, R);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = '#e8e4df';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Data polygon
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2;
    const p = point(angle, R * values[i]);
    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(201,162,39,0.15)';
  ctx.fill();
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dots
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2;
    const p = point(angle, R * values[i]);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#c9a227';
    ctx.fill();
  }

  // Labels
  ctx.fillStyle = '#4a4642';
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.textAlign = 'center';
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2;
    const p = point(angle, R + 16);
    ctx.fillText(labels[i], p.x, p.y + 3);
  }
}

/* ═══════════════════════════════════════════════════════════
   DELIVERY TRACKING
═══════════════════════════════════════════════════════════ */
function trackOrder() {
  const input = document.getElementById('trackingInput').value.trim();
  if (!input) { showToast('Please enter an Order ID', 'error'); return; }

  const btn = document.getElementById('trackBtn');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tracking...';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = 'Track Order';
    btn.disabled = false;
    document.getElementById('trackingResult').style.display = 'block';
    document.getElementById('trackingResult').style.animation = 'fadeUp 0.5s ease forwards';
    showToast('<i class="fas fa-truck"></i> Order found! Delivery by tomorrow.', 'success');
  }, 1800);
}

/* ═══════════════════════════════════════════════════════════
   SMART BILLING
═══════════════════════════════════════════════════════════ */
function selectPayment(method) {
  state.paymentMethod = method;
  document.querySelectorAll('.pay-method').forEach(el => el.classList.remove('active'));
  document.getElementById(`pm-${method}`).classList.add('active');

  const form = document.getElementById('paymentForm');
  if (method === 'card') {
    form.innerHTML = `
      <div class="form-group">
        <label>Card Number</label>
        <input type="text" placeholder="4242 4242 4242 4242" class="form-input" maxlength="19" id="cardNumber" oninput="formatCard(this)" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Expiry</label>
          <input type="text" placeholder="MM / YY" class="form-input" maxlength="7" id="cardExpiry" oninput="formatExpiry(this)" />
        </div>
        <div class="form-group">
          <label>CVV</label>
          <input type="text" placeholder="•••" class="form-input" maxlength="3" id="cardCvv" />
        </div>
      </div>
      <div class="form-group">
        <label>Name on Card</label>
        <input type="text" placeholder="PRIYA SHARMA" class="form-input" id="cardName" />
      </div>`;
  } else if (method === 'upi') {
    form.innerHTML = `
      <div class="form-group">
        <label>UPI ID</label>
        <input type="text" placeholder="yourname@upi" class="form-input" />
      </div>`;
  } else if (method === 'emi') {
    form.innerHTML = `
      <div class="form-group">
        <label>Select EMI Plan</label>
        <select class="form-input">
          <option>3 months — Zero Cost EMI</option>
          <option>6 months — Zero Cost EMI</option>
          <option>12 months — 1.5% p.m.</option>
        </select>
      </div>
      <div class="form-group">
        <label>Card Number</label>
        <input type="text" placeholder="4242 4242 4242 4242" class="form-input" maxlength="19" />
      </div>`;
  } else if (method === 'wallet') {
    form.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <button class="btn-outline" style="justify-content:flex-start;gap:12px;"><i class="fas fa-wallet" style="color:var(--gold)"></i>PhonePe Wallet — ₹1,240 available</button>
        <button class="btn-outline" style="justify-content:flex-start;gap:12px;"><i class="fas fa-wallet" style="color:#0070f3"></i>Paytm Wallet — ₹4,500 available</button>
      </div>`;
  }
}

function formatCard(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 2) v = v.substring(0, 2) + ' / ' + v.substring(2);
  input.value = v;
}

function applyCoupon() {
  const code = document.getElementById('couponInput').value.trim().toUpperCase();
  const validCodes = ['STYLE10', 'LUXURY10', 'VERSE10', 'VIP10'];
  const btn = document.getElementById('applyCouponBtn');

  if (validCodes.includes(code)) {
    state.couponApplied = true;
    btn.textContent = '✓ Applied';
    btn.style.background = '#27ae60';
    renderBillingCart();
    showToast('<i class="fas fa-tag"></i> Coupon applied! 10% discount unlocked.', 'success');
  } else if (code) {
    showToast('Invalid coupon code. Try: STYLE10', 'error');
    document.getElementById('couponInput').style.borderColor = '#e74c3c';
    setTimeout(() => document.getElementById('couponInput').style.borderColor = '', 2000);
  } else {
    showToast('Please enter a coupon code');
  }
}

function processCheckout() {
  if (state.cart.length === 0) {
    showToast('Your cart is empty! Add items to checkout.', 'error');
    scrollToSection('collections');
    return;
  }
  const btn = document.getElementById('checkoutBtn');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-lock"></i> Secure Checkout';
    btn.disabled = false;
    const orderNum = Math.floor(8000 + Math.random() * 2000);
    document.getElementById('orderNum').textContent = orderNum;
    document.getElementById('checkoutModal').style.display = 'flex';
    document.getElementById('checkoutModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    state.cart = [];
    saveCartToStorage();
    updateCartUI();
  }, 2200);
}

function closeCheckoutModal() {
  document.getElementById('checkoutModal').style.display = 'none';
  document.getElementById('checkoutModal').classList.remove('active');
  document.body.style.overflow = '';
  scrollToSection('home');
}

/* ═══════════════════════════════════════════════════════════
   INVENTORY
═══════════════════════════════════════════════════════════ */
function refreshInventory() {
  const btn = document.querySelector('.chart-btn');
  if (btn) {
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-sync-alt"></i> Sync';
      const vals = [1248, 1264, 1232, 1256];
      const invEl = document.getElementById('invTotal');
      if (invEl) invEl.textContent = vals[Math.floor(Math.random() * vals.length)].toLocaleString();
      showToast('<i class="fas fa-boxes"></i> Inventory synced successfully!', 'success');
    }, 1500);
  }
}

/* ═══════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════ */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.4s ease forwards';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
