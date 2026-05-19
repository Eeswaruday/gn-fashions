// Navigation Hamburger Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const WHATSAPP_NUMBER = '9705220405';
const MAPS_LINK = 'https://maps.app.goo.gl/YmY9kFZ1gDRmnr8U8';

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu) navMenu.classList.remove('active');
        if (hamburger) hamburger.classList.remove('active');
    });
});

function updateActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentPage);
    });
}
updateActiveLink();

// Carousel functionality
let currentCarouselIndex = 0;

const carouselInner = document.getElementById('carousel-inner');
const carouselItems = document.querySelectorAll('.carousel-item');

const visibleSlides = 2;

function showCarouselSlide(index) {

    if (!carouselInner || carouselItems.length === 0) return;

    const maxIndex = carouselItems.length - visibleSlides;

    if (index > maxIndex) {
        currentCarouselIndex = maxIndex;
    } else if (index < 0) {
        currentCarouselIndex = 0;
    } else {
        currentCarouselIndex = index;
    }

    const movePercentage = currentCarouselIndex * 50;

    carouselInner.style.transform =
        `translateX(-${movePercentage}%)`;
}

function nextSlide() {
    showCarouselSlide(currentCarouselIndex + 1);
}

function prevSlide() {
    showCarouselSlide(currentCarouselIndex - 1);
}

setInterval(() => {
    if (carouselItems.length > 0) nextSlide();
}, 5000);

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
}

const categoryLabels = {
    womens: "Women's Wear",
    mens: "Men's Wear",
    kids: 'Kids Wear',
    ethnic: 'Ethnic Wear',
    western: 'Western Wear',
    accessories: 'Accessories',
    festival: 'Festival Collection',
    new: 'New Arrivals'
};

const products = window.GN_PRODUCTS || [];

function getCart() {
    try {
        return JSON.parse(localStorage.getItem('gnFashionsCart')) || [];
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('gnFashionsCart', JSON.stringify(cart));
    renderCart();
}

function addToCart(productId) {
    const product = products.find(item => item.id === productId);
    if (!product) return;
    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ id: productId, quantity: 1 });
    saveCart(cart);
    showCartMessage(`${product.name} added to cart`);
}

function changeCartQuantity(productId, change) {
    const cart = getCart().map(item => {
        if (item.id === productId) return { ...item, quantity: item.quantity + change };
        return item;
    }).filter(item => item.quantity > 0);
    saveCart(cart);
}

function removeFromCart(productId) {
    saveCart(getCart().filter(item => item.id !== productId));
}

function getCartDetails() {
    return getCart()
        .map(item => {
            const product = products.find(productItem => productItem.id === item.id);
            return product ? { ...product, quantity: item.quantity } : null;
        })
        .filter(Boolean);
}

function getCartTotal(items) {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

function buildWhatsAppMessage(items) {
    const lines = [
        'Hello GN Fashions,',
        'I am interested in buying these products:',
        ''
    ];

    items.forEach((item, index) => {
        lines.push(`${index + 1}. ${item.name}`);
        lines.push(`Category: ${categoryLabels[item.category]}`);
        lines.push(`Qty: ${item.quantity}`);
        lines.push(`Price: Rs. ${item.price} each`);
        lines.push(`Photo: ${item.image}`);
        lines.push('');
    });

    lines.push(`Total estimated amount: Rs. ${getCartTotal(items)}`);
    lines.push('Please confirm availability, sizes, colors, and final billing.');
    return lines.join('\n');
}

function buyCartOnWhatsApp() {
    const items = getCartDetails();
    if (items.length === 0) {
        showCartMessage('Please add products before buying');
        return;
    }
    const message = encodeURIComponent(buildWhatsAppMessage(items));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
}

function showCartMessage(text) {
    let toast = document.querySelector('.cart-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'cart-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(showCartMessage.timer);
    showCartMessage.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function openCart() {
    document.body.classList.add('cart-open');
}

function closeCart() {
    document.body.classList.remove('cart-open');
}

function renderCart() {
    const drawer = document.getElementById('cart-drawer');
    const badge = document.getElementById('cart-count');
    if (!drawer || !badge) return;

    const items = getCartDetails();
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    badge.textContent = itemCount;
    badge.hidden = itemCount === 0;

    const cartBody = drawer.querySelector('.cart-body');
    const cartFooter = drawer.querySelector('.cart-footer');

    if (items.length === 0) {
        cartBody.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <h3>Your cart is empty</h3>
                <p>Add sarees, kurtis, kids wear, accessories, and festival styles before checkout.</p>
            </div>
        `;
        cartFooter.innerHTML = `
            <button class="btn btn-primary cart-buy-btn" disabled>Buy on WhatsApp</button>
        `;
        return;
    }

    cartBody.innerHTML = items.map(item => `
        <article class="cart-item">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${categoryLabels[item.category]} | Rs. ${item.price}</p>
                <div class="quantity-control" aria-label="Quantity controls for ${item.name}">
                    <button type="button" onclick="changeCartQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button type="button" onclick="changeCartQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="remove-item" type="button" onclick="removeFromCart(${item.id})" aria-label="Remove ${item.name}">
                <i class="fas fa-times"></i>
            </button>
        </article>
    `).join('');

    cartFooter.innerHTML = `
        <div class="cart-total">
            <span>Total</span>
            <strong>Rs. ${getCartTotal(items)}</strong>
        </div>
        <p class="cart-note">Checkout opens WhatsApp with product names, quantities, prices, and photo links.</p>
        <button class="btn btn-primary cart-buy-btn" type="button" onclick="buyCartOnWhatsApp()">
            <i class="fab fa-whatsapp"></i> Buy on WhatsApp
        </button>
    `;
}

function createCartDrawer() {
    if (document.getElementById('cart-drawer')) return;

    const cartButton = Array.from(document.querySelectorAll('.nav-icon-btn'))
        .find(button => button.querySelector('.fa-shopping-bag'));

    if (cartButton) {
        cartButton.type = 'button';
        cartButton.classList.add('cart-nav-btn');
        cartButton.setAttribute('aria-label', 'Open shopping cart');
        cartButton.innerHTML = '<i class="fas fa-shopping-bag"></i><span class="cart-count" id="cart-count" hidden>0</span>';
        cartButton.addEventListener('click', openCart);
    }

    const cartMarkup = document.createElement('div');
    cartMarkup.innerHTML = `
        <div class="cart-overlay" onclick="closeCart()"></div>
        <aside class="cart-drawer" id="cart-drawer" aria-label="Shopping cart">
            <div class="cart-header">
                <div>
                    <span class="eyebrow">GN Fashions</span>
                    <h2>Your Cart</h2>
                </div>
                <button type="button" class="cart-close" onclick="closeCart()" aria-label="Close cart">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="cart-body"></div>
            <div class="cart-footer"></div>
        </aside>
    `;
    document.body.appendChild(cartMarkup);
    renderCart();
}

function productCard(product) {
    return `
        <article class="product-card" style="animation: slideUp 0.3s ease;">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${product.discount > 0 ? `<div class="product-badge">-${product.discount}%</div>` : ''}
                <button class="quick-view-btn" type="button" onclick="quickView(${product.id})">Quick View</button>
            </div>
            <div class="product-info">
                <p class="product-category">${categoryLabels[product.category]}</p>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    ${product.discount > 0 ? `<span class="original">Rs. ${product.original}</span>` : ''}
                    <span class="discount">Rs. ${product.price}</span>
                </div>
                <button class="btn btn-primary" type="button" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </article>
    `;
}

function filterProducts(category, clickedButton) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (clickedButton) clickedButton.classList.add('active');
    const filtered = category === 'all' ? products : products.filter(product => product.category === category);
    displayProducts(filtered);
}

function displayProducts(productsToDisplay) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    productsGrid.innerHTML = productsToDisplay.map(productCard).join('');
}

function quickView(productId) {
    const product = products.find(item => item.id === productId);
    if (!product) return;
    const existingModal = document.querySelector('.quick-view-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.innerHTML = `
        <div class="quick-view-backdrop" onclick="closeQuickView()"></div>
        <div class="quick-view-panel" role="dialog" aria-modal="true" aria-label="${product.name} quick view">
            <button class="cart-close quick-close" type="button" onclick="closeQuickView()" aria-label="Close quick view">
                <i class="fas fa-times"></i>
            </button>
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="quick-view-content">
                <span class="product-category">${categoryLabels[product.category]}</span>
                <h2>${product.name}</h2>
                <p>Selected for GN Fashions customers who want trendy, festive, and affordable styles in Maddipadu.</p>
                <strong>Rs. ${product.price}</strong>
                <button class="btn btn-primary" type="button" onclick="addToCart(${product.id}); closeQuickView();">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeQuickView() {
    const modal = document.querySelector('.quick-view-modal');
    if (modal) modal.remove();
}

// Banner Slider
let currentBannerIndex = 0;
const bannerSlides = document.querySelectorAll('.banner-slide');

function showBannerSlide(index) {
    if (bannerSlides.length === 0) return;
    bannerSlides.forEach(slide => slide.classList.remove('active'));
    if (index >= bannerSlides.length) currentBannerIndex = 0;
    else if (index < 0) currentBannerIndex = bannerSlides.length - 1;
    else currentBannerIndex = index;
    bannerSlides[currentBannerIndex].classList.add('active');
}

function changeSlide(direction) {
    showBannerSlide(currentBannerIndex + direction);
}

setInterval(() => {
    if (bannerSlides.length > 0) changeSlide(1);
}, 6000);

function updateFlashTimer() {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;
    let seconds = 4 * 3600 + 32 * 60 + 15;
    setInterval(() => {
        seconds -= 1;
        if (seconds < 0) seconds = 4 * 3600 + 32 * 60 + 15;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);
}

function joinStyleUpdates() {
    const phoneInput = document.getElementById('updates-phone');
    const selectedPreferences = Array.from(document.querySelectorAll('.style-preferences input:checked'))
        .map(input => input.value);
    const customerPhone = phoneInput ? phoneInput.value.trim() : '';
    const preferencesText = selectedPreferences.length ? selectedPreferences.join(', ') : 'All latest collections';
    const message = encodeURIComponent(
        `Hello GN Fashions,\nI want to receive style updates.\nMy WhatsApp number: ${customerPhone || 'Not entered'}\nInterested in: ${preferencesText}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
    if (phoneInput) phoneInput.value = '';
    document.querySelectorAll('.style-preferences input:checked').forEach(input => {
        input.checked = false;
    });
}

function submitForm(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    if (name && phone && email && message) {
        const whatsappMessage = encodeURIComponent(`Hello GN Fashions,\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nMessage: ${message}`);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`, '_blank');
        document.querySelector('.contact-form').reset();
    }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    navbar.style.boxShadow = window.scrollY > 50
        ? '0 5px 20px rgba(0, 0, 0, 0.15)'
        : '0 2px 10px rgba(0, 0, 0, 0.1)';
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeCart();
        closeQuickView();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    createCartDrawer();
    if (document.getElementById('products-grid')) displayProducts(products);
    if (bannerSlides.length > 0) showBannerSlide(0);
    if (carouselItems.length > 0) showCarouselSlide(0);
    updateFlashTimer();
});
