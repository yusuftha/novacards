// Nova Cards Common JS

let cart = JSON.parse(localStorage.getItem('tcg_cart')) || [];

$(document).ready(function() {
    updateCartBadge();
    checkAuthStatus();
    initTheme();
    initSearch();
});

// Search Management
function initSearch() {
    const searchHtml = `
        <div id="search-overlay">
            <div class="search-close"><i class="bi bi-x-lg"></i></div>
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        <input type="text" class="search-input-field" placeholder="Koleksiyonunuzdaki eksik parçayı arayın..." autofocus>
                        <div id="search-results" class="mt-5 row g-3"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    $('body').append(searchHtml);

    $('#search-trigger').click(function() {
        $('#search-overlay').fadeIn(300);
        $('.search-input-field').focus();
    });

    $('.search-close, #search-overlay').click(function(e) {
        if (e.target !== this && !$(e.target).hasClass('search-close') && !$(e.target).parent().hasClass('search-close')) return;
        $('#search-overlay').fadeOut(300);
    });

    $('.search-input-field').on('input', function() {
        const query = $(this).val().toLowerCase();
        if (query.length < 2) {
            $('#search-results').empty();
            return;
        }

        $.get('/api/products', function(products) {
            const matches = products.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.set?.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );

            let html = '';
            matches.forEach(p => {
                html += `
                    <div class="col-12">
                        <a href="product.html?id=${p.id}" class="search-result-item d-flex align-items-center gap-4 text-decoration-none">
                            <img src="${p.image}" alt="${p.name}" style="width: 60px; height: 80px; object-fit: contain;">
                            <div>
                                <h6 class="fw-bold text-main mb-1 uppercase tracking-tight">${p.name}</h6>
                                <p class="x-small text-muted mb-0 uppercase tracking-widest fw-bold">${p.category} | $${p.price}</p>
                            </div>
                        </a>
                    </div>
                `;
            });
            $('#search-results').html(html || '<div class="col-12 text-center text-muted py-5 fw-bold uppercase x-small tracking-widest">Sonuç bulunamadı.</div>');
        });
    });
}

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('tcg_theme') || 'light';
    setTheme(savedTheme);

    $('#theme-toggle').click(function() {
        const currentTheme = $('html').attr('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
}

function setTheme(theme) {
    $('html').attr('data-theme', theme);
    localStorage.setItem('tcg_theme', theme);
    
    const themeIcon = theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill';
    $('#theme-toggle i').attr('class', `bi ${themeIcon}`);
}

// Auth Status
function checkAuthStatus() {
    $.get('/api/me', function(data) {
        const authContainer = $('#auth-actions');
        authContainer.find('.auth-in, .auth-out').remove();
        
        if (data.loggedIn) {
            authContainer.prepend(`
                <div class="auth-in d-flex align-items-center gap-3">
                    <span class="x-small fw-bold d-none d-md-inline uppercase tracking-widest text-muted">SELAM, ${data.user.name.split(' ')[0]}</span>
                    <button onclick="logout()" class="btn btn-sm text-primary-red p-0 fw-bold x-small uppercase tracking-widest border-0">ÇIKIŞ</button>
                </div>
            `);
        } else {
            authContainer.prepend(`
                <div class="auth-out">
                    <a href="auth.html" class="p-2" title="Giriş Yap" style="color: var(--text-main);"><i class="bi bi-person h5 mb-0"></i></a>
                </div>
            `);
        }
    });
}

function logout() {
    $.get('/api/logout', function() {
        location.reload();
    });
}

// Cart Logic
function addToCart(productId) {
    $.get(`/api/products/${productId}`, function(product) {
        const existing = cart.find(item => item.id === productId);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        showToast(`Koleksiyona Eklendi: ${product.name}`);
    });
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    location.reload();
}

function updateQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, item.quantity + delta);
        saveCart();
        renderCart(); // for cart page
    }
}

function saveCart() {
    localStorage.setItem('tcg_cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    const badge = $('#cart-badge');
    if (count > 0) {
        badge.removeClass('opacity-0').text(count);
    } else {
        badge.addClass('opacity-0');
    }
}

// Utils
function getUrlParam(name) {
    const results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results ? decodeURIComponent(results[1]) : null;
}

function showToast(message) {
    // Basic toast alert
    const toast = $(`
        <div class="fixed-bottom p-3 d-flex justify-content-center" style="z-index: 9999">
            <div class="bg-dark text-white px-4 py-3 rounded shadow-lg fw-bold small text-uppercase tracking-wider">
                ${message}
            </div>
        </div>
    `);
    $('body').append(toast);
    setTimeout(() => toast.fadeOut(() => toast.remove()), 2000);
}
