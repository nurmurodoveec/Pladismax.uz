import { supabaseClient, signOut } from '../supabase-client.js';

let currentTab = 'catalog';
let products = [];
let orders = [];
let cart = [];
let profile = null;

const clientMenuItems = [
    { id: 'catalog', label: 'Каталог', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>' },
    { id: 'orders', label: 'Мои заказы', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>' },
    { id: 'cart', label: 'Корзина', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>' }
];

export async function renderClientDashboard(userProfile) {
    profile = userProfile;
    const app = document.getElementById('app');

    if (profile.is_archived) {
        app.innerHTML = `
            <div class="header">
                <div class="header-content">
                    <h1 class="header-title">Pladis Max</h1>
                    <div class="header-user">
                        <div class="user-info">
                            <div class="user-name">${profile.full_name || profile.email}</div>
                            <div class="user-role">Клиент</div>
                        </div>
                        <button class="btn btn-danger" id="logout-btn">Выйти</button>
                    </div>
                </div>
            </div>
            <div class="container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center;">
                <div style="background: #f3f4f6; border-radius: 50%; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <line x1="4" y1="4" x2="20" y2="20" stroke="#9ca3af" stroke-width="2"></line>
                    </svg>
                </div>
                <h2 style="font-size: 24px; font-weight: 700; color: #374151; margin-bottom: 12px;">Аккаунт деактивирован</h2>
                <p style="font-size: 16px; color: #6b7280; max-width: 400px; line-height: 1.6;">
                    Ваш аккаунт был перемещен в архив. Каталог товаров недоступен.
                </p>
                <p style="font-size: 14px; color: #9ca3af; margin-top: 16px;">
                    Для восстановления доступа обратитесь к администратору.
                </p>
            </div>
        `;
        document.getElementById('logout-btn').addEventListener('click', async () => {
            await signOut();
        });
        return;
    }

    const { data: ordersData } = await supabaseClient
        .from('orders')
        .select('debt_amount')
        .eq('client_id', profile.id)
        .gt('debt_amount', 0);

    const totalDebt = (ordersData || []).reduce((sum, o) => sum + o.debt_amount, 0);

    let countdownHtml = '';
    if (profile.is_blocked && profile.blocked_until) {
        const blockedUntil = new Date(profile.blocked_until);
        const now = new Date();
        const diffMs = blockedUntil - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        countdownHtml = `
            <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                <div class="countdown-grid">
                    <div style="text-align: center;">
                        <div style="font-size: 13px; color: #991b1b; margin-bottom: 6px; font-weight: 600;">
                            БЛОКИРОВКА
                        </div>
                        <div style="font-size: 40px; font-weight: 800; color: #dc2626; line-height: 1;">
                            ${diffDays > 0 ? diffDays : 0}
                        </div>
                        <div style="font-size: 14px; color: #991b1b;">
                            дней осталось
                        </div>
                        <div style="font-size: 12px; color: #666; margin-top: 6px;">
                            до ${blockedUntil.toLocaleDateString()}
                        </div>
                    </div>
                    <div style="text-align: center; border-left: 2px solid #fecaca; padding-left: 20px;">
                        <div style="font-size: 13px; color: #666; margin-bottom: 6px; font-weight: 600;">
                            ОБЩАЯ ЗАДОЛЖЕННОСТЬ
                        </div>
                        <div style="font-size: 28px; font-weight: 800; color: #dc2626; line-height: 1;">
                            ${totalDebt.toFixed(2)} сум
                        </div>
                        ${profile.blocked_reason ? `
                            <div style="font-size: 12px; color: #991b1b; margin-top: 6px;">
                                ${profile.blocked_reason}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (totalDebt > 0) {
        countdownHtml = `
            <div style="background: #fffbeb; border: 2px solid #fde68a; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 16px; justify-content: center;">
                    <div style="width: 48px; height: 48px; background: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    <div>
                        <div style="font-size: 13px; color: #92400e; margin-bottom: 4px; font-weight: 600;">
                            ОБЩАЯ ЗАДОЛЖЕННОСТЬ
                        </div>
                        <div style="font-size: 28px; font-weight: 800; color: #d97706; line-height: 1;">
                            ${totalDebt.toFixed(2)} сум
                        </div>
                        <div style="font-size: 12px; color: #666; margin-top: 4px;">
                            Активных долгов: ${(ordersData || []).length}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    app.innerHTML = `
        <div class="header">
            <div class="header-content">
                <h1 class="header-title">B2B Платформа</h1>
                <div class="header-user">
                    <div class="user-info">
                        <div class="user-name">${profile.full_name || profile.email}</div>
                        <div class="user-role">Клиент</div>
                    </div>
                    <button class="btn btn-danger" id="logout-btn">Выйти</button>
                    <button class="mobile-menu-btn" id="mobile-menu-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <div class="mobile-nav-overlay" id="mobile-nav-overlay"></div>
        <div class="mobile-nav" id="mobile-nav">
            <div class="mobile-nav-header">
                <span class="mobile-nav-title">Меню</span>
                <button class="mobile-nav-close" id="mobile-nav-close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="mobile-nav-items">
                ${clientMenuItems.map(item => `
                    <button class="mobile-nav-item ${currentTab === item.id ? 'active' : ''}" data-tab="${item.id}">
                        ${item.icon}
                        ${item.label}
                        ${item.id === 'cart' ? '<span class="badge badge-danger mobile-cart-badge" style="margin-left: auto; display: none;">0</span>' : ''}
                    </button>
                `).join('')}
            </div>
        </div>

        <div class="container">
            ${profile.is_blocked ? `
                <div class="alert alert-warning">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <div>
                        <strong>Ваш аккаунт заблокирован</strong><br>
                        ${profile.blocked_until ? `Блокировка действует до: ${new Date(profile.blocked_until).toLocaleDateString()}` : 'Обратитесь к администратору'}<br>
                        ${profile.blocked_reason ? `Причина: ${profile.blocked_reason}` : ''}
                    </div>
                </div>
            ` : ''}

            ${countdownHtml}

            <div class="tabs">
                <button class="tab active" data-tab="catalog">Каталог</button>
                <button class="tab" data-tab="orders">Мои заказы</button>
                <button class="tab cart-tab" data-tab="cart">
                    Корзина
                    <span class="badge badge-danger" id="cart-badge" style="margin-left: 8px; display: none;">0</span>
                </button>
            </div>

            <div id="tab-content"></div>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', async () => {
        await signOut();
    });

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const mobileNavClose = document.getElementById('mobile-nav-close');

    function openMobileNav() {
        mobileNav.classList.add('active');
        mobileNavOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileNav() {
        mobileNav.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    mobileMenuBtn.addEventListener('click', openMobileNav);
    mobileNavClose.addEventListener('click', closeMobileNav);
    mobileNavOverlay.addEventListener('click', closeMobileNav);

    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const tab = e.currentTarget.dataset.tab;
            currentTab = tab;
            document.querySelectorAll('.mobile-nav-item').forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');
            document.querySelectorAll('.tab').forEach(t => {
                t.classList.toggle('active', t.dataset.tab === tab);
            });
            closeMobileNav();
            renderTabContent();
        });
    });

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const button = e.target.closest('.tab');
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            button.classList.add('active');
            currentTab = button.dataset.tab;
            renderTabContent();
        });
    });

    await renderTabContent();
}

async function renderTabContent() {
    const content = document.getElementById('tab-content');

    switch (currentTab) {
        case 'catalog':
            await renderCatalogTab(content);
            break;
        case 'orders':
            await renderOrdersTab(content);
            break;
        case 'cart':
            renderCartTab(content);
            break;
    }
}

let activePromotions = [];
let productPromotions = {};
let currentSort = 'name';
let currentCategory = 'all';
let categories = [];
let allProducts = [];

async function renderCatalogTab(container) {
    container.innerHTML = '<div class="spinner"></div>';

    const [productsResult, promotionsResult, categoriesResult, imagesResult] = await Promise.all([
        supabaseClient.from('products').select('*').eq('is_active', true).or('is_deleted.is.null,is_deleted.eq.false'),
        supabaseClient.from('promotions').select('*, promotion_products(product_id)').eq('is_active', true).lte('start_date', new Date().toISOString()).gte('end_date', new Date().toISOString()),
        supabaseClient.from('categories').select('*').eq('is_active', true).order('name'),
        supabaseClient.from('product_images').select('*').order('display_order')
    ]);

    if (productsResult.error) {
        container.innerHTML = '<div class="alert alert-error">Ошибка загрузки товаров</div>';
        return;
    }

    allProducts = productsResult.data || [];
    activePromotions = promotionsResult.data || [];
    categories = categoriesResult.data || [];

    const productImagesMap = {};
    (imagesResult.data || []).forEach(img => {
        if (!productImagesMap[img.product_id]) {
            productImagesMap[img.product_id] = [];
        }
        productImagesMap[img.product_id].push(img);
    });

    allProducts.forEach(p => {
        p.images = productImagesMap[p.id] || [];
        if (p.images.length === 0 && p.image_url) {
            p.images = [{ image_url: p.image_url, is_primary: true }];
        }
    });

    productPromotions = {};
    activePromotions.forEach(promo => {
        if (promo.type === 'global') {
            allProducts.forEach(p => {
                if (!productPromotions[p.id]) productPromotions[p.id] = [];
                productPromotions[p.id].push(promo);
            });
        } else if (promo.type === 'product') {
            (promo.promotion_products || []).forEach(pp => {
                if (!productPromotions[pp.product_id]) productPromotions[pp.product_id] = [];
                productPromotions[pp.product_id].push(promo);
            });
        }
    });

    const canSeeDiscounts = profile.can_see_discounts !== false;

    allProducts.forEach(p => {
        const promos = productPromotions[p.id] || [];
        p.hasPromo = canSeeDiscounts && promos.length > 0;
        p.discountedPrice = p.price;
        if (p.hasPromo) {
            const bestPromo = promos.sort((a, b) => b.priority - a.priority)[0];
            if (bestPromo.discount_type === 'percentage') {
                p.discountedPrice = p.price * (1 - bestPromo.discount_value / 100);
            } else {
                p.discountedPrice = Math.max(0, p.price - bestPromo.discount_value);
            }
            p.discountPercent = Math.round((1 - p.discountedPrice / p.price) * 100);
        }
    });

    filterAndSortProducts();

    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                <h2 class="card-title" style="margin: 0;">Каталог товаров</h2>
                <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                    ${categories.length > 0 ? `
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <span style="font-size: 13px; color: var(--text-gray);">Категория:</span>
                            <select id="category-select" class="form-control" style="width: auto; padding: 8px 12px;">
                                <option value="all" ${currentCategory === 'all' ? 'selected' : ''}>Все категории</option>
                                ${categories.map(cat => `
                                    <option value="${cat.id}" ${currentCategory === cat.id ? 'selected' : ''}>${cat.name}</option>
                                `).join('')}
                            </select>
                        </div>
                    ` : ''}
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="font-size: 13px; color: var(--text-gray);">Сортировка:</span>
                        <select id="sort-select" class="form-control" style="width: auto; padding: 8px 12px;">
                            <option value="name" ${currentSort === 'name' ? 'selected' : ''}>По названию</option>
                            <option value="promo" ${currentSort === 'promo' ? 'selected' : ''}>Сначала акции</option>
                            <option value="discount" ${currentSort === 'discount' ? 'selected' : ''}>По размеру скидки</option>
                            <option value="price_asc" ${currentSort === 'price_asc' ? 'selected' : ''}>Цена: по возрастанию</option>
                            <option value="price_desc" ${currentSort === 'price_desc' ? 'selected' : ''}>Цена: по убыванию</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="grid grid-4" id="products-grid">
                ${products.length > 0 ? products.map(product => renderProductCard(product)).join('') : '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-gray);">Нет товаров в выбранной категории</div>'}
            </div>
        </div>
    `;

    document.getElementById('category-select')?.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        filterAndSortProducts();
        document.getElementById('products-grid').innerHTML = products.length > 0 ? products.map(product => renderProductCard(product)).join('') : '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-gray);">Нет товаров в выбранной категории</div>';
        setupProductCardHandlers();
    });

    document.getElementById('sort-select')?.addEventListener('change', (e) => {
        currentSort = e.target.value;
        filterAndSortProducts();
        document.getElementById('products-grid').innerHTML = products.length > 0 ? products.map(product => renderProductCard(product)).join('') : '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-gray);">Нет товаров в выбранной категории</div>';
        setupProductCardHandlers();
    });

    setupProductCardHandlers();
}

function filterAndSortProducts() {
    if (currentCategory === 'all') {
        products = [...allProducts];
    } else {
        products = allProducts.filter(p => p.category_id === currentCategory);
    }
    sortProducts();
}

function sortProducts() {
    switch (currentSort) {
        case 'name':
            products.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'promo':
            products.sort((a, b) => (b.hasPromo ? 1 : 0) - (a.hasPromo ? 1 : 0) || a.name.localeCompare(b.name));
            break;
        case 'discount':
            products.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
            break;
        case 'price_asc':
            products.sort((a, b) => a.discountedPrice - b.discountedPrice);
            break;
        case 'price_desc':
            products.sort((a, b) => b.discountedPrice - a.discountedPrice);
            break;
    }
}

function renderProductCard(product) {
    const cartItem = cart.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 1;
    const isOutOfStock = product.stock_quantity === 0;
    const hasMultipleImages = product.images && product.images.length > 1;
    const primaryImage = product.images && product.images.length > 0
        ? product.images.find(img => img.is_primary)?.image_url || product.images[0].image_url
        : product.image_url;

    return `
        <div class="product-card" style="position: relative;">
            ${product.hasPromo ? `
                <div style="position: absolute; top: 12px; left: 12px; background: #f97316; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 700; z-index: 1;">
                    -${product.discountPercent}%
                </div>
            ` : ''}
            ${hasMultipleImages ? `
                <div style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; z-index: 1; display: flex; align-items: center; gap: 4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    ${product.images.length}
                </div>
            ` : ''}
            <div class="product-image" data-action="view-images" data-product-id="${product.id}" style="cursor: ${primaryImage ? 'pointer' : 'default'};">
                ${primaryImage
                    ? `<img src="${primaryImage}" alt="${product.name}">`
                    : `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                      </svg>`
                }
            </div>
            <div class="product-body">
                <h3 class="product-name">${product.name}</h3>
                ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
                <div class="flex-between mb-2">
                    <div>
                        ${product.hasPromo ? `
                            <span style="text-decoration: line-through; color: #999; font-size: 13px;">${product.price.toFixed(2)}</span>
                            <div class="product-price" style="color: #f97316;">${product.discountedPrice.toFixed(2)} сум</div>
                        ` : `
                            <div class="product-price">${product.price.toFixed(2)} сум</div>
                        `}
                    </div>
                    <div style="font-size: 13px; color: var(--text-gray);">${product.unit_type}</div>
                </div>

                ${!isOutOfStock ? `
                    <div class="quantity-control">
                        <button class="quantity-btn" data-action="decrease" data-product-id="${product.id}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <input type="number" class="quantity-input" id="qty-${product.id}" value="${quantity}" min="1" max="${product.stock_quantity}" data-product-id="${product.id}">
                        <button class="quantity-btn" data-action="increase" data-product-id="${product.id}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                    <button class="btn ${cartItem ? 'btn-secondary' : 'btn-primary'}" style="width: 100%;" data-action="add-to-cart" data-product-id="${product.id}">
                        ${cartItem ? 'Обновить' : 'В корзину'}
                    </button>
                ` : `
                    <div style="background: var(--bg-gray); color: var(--text-gray); text-align: center; padding: 12px; border-radius: 8px; font-weight: 600;">
                        Нет в наличии
                    </div>
                `}
            </div>
        </div>
    `;
}

function setupProductCardHandlers() {
    document.querySelectorAll('[data-action="decrease"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            const input = document.getElementById(`qty-${productId}`);
            const newValue = Math.max(1, parseInt(input.value) - 1);
            input.value = newValue;
        });
    });

    document.querySelectorAll('[data-action="increase"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            const input = document.getElementById(`qty-${productId}`);
            const product = products.find(p => p.id === productId);
            const newValue = Math.min(product.stock_quantity, parseInt(input.value) + 1);
            input.value = newValue;
        });
    });

    document.querySelectorAll('[data-action="add-to-cart"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            const quantity = parseInt(document.getElementById(`qty-${productId}`).value);
            const product = products.find(p => p.id === productId);

            if (quantity > product.stock_quantity) {
                alert('Недостаточно товара на складе');
                return;
            }

            addToCart(product, quantity);
        });
    });

    document.querySelectorAll('[data-action="view-images"]').forEach(el => {
        el.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            const product = products.find(p => p.id === productId);
            if (product && product.images && product.images.length > 0) {
                showImageGallery(product);
            }
        });
    });
}

function showImageGallery(product) {
    const images = product.images || [];
    if (images.length === 0) return;

    let currentIndex = 0;
    const modal = document.createElement('div');
    modal.className = 'image-gallery-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 10000; display: flex; flex-direction: column; align-items: center; justify-content: center;';

    function updateGallery() {
        const mainImage = modal.querySelector('.gallery-main-image');
        const counter = modal.querySelector('.gallery-counter');
        const thumbnails = modal.querySelectorAll('.gallery-thumb');

        if (mainImage) mainImage.src = images[currentIndex].image_url;
        if (counter) counter.textContent = `${currentIndex + 1} / ${images.length}`;

        thumbnails.forEach((thumb, idx) => {
            thumb.style.border = idx === currentIndex ? '3px solid #10b981' : '3px solid transparent';
            thumb.style.opacity = idx === currentIndex ? '1' : '0.6';
        });
    }

    modal.innerHTML = `
        <button class="gallery-close" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.1); border: none; color: white; width: 48px; height: 48px; border-radius: 50%; cursor: pointer; font-size: 24px; display: flex; align-items: center; justify-content: center; z-index: 10;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>

        <div style="color: white; text-align: center; margin-bottom: 16px; padding: 0 20px;">
            <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">${product.name}</h3>
            <span class="gallery-counter" style="font-size: 14px; color: rgba(255,255,255,0.7);">1 / ${images.length}</span>
        </div>

        <div style="position: relative; flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; max-width: 900px; padding: 0 60px;">
            ${images.length > 1 ? `
                <button class="gallery-prev" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.1); border: none; color: white; width: 48px; height: 48px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 5;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
            ` : ''}

            <img class="gallery-main-image" src="${images[0].image_url}" alt="${product.name}" style="max-width: 100%; max-height: 60vh; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">

            ${images.length > 1 ? `
                <button class="gallery-next" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.1); border: none; color: white; width: 48px; height: 48px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 5;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            ` : ''}
        </div>

        ${images.length > 1 ? `
            <div style="display: flex; gap: 8px; margin-top: 20px; padding: 0 20px; overflow-x: auto; max-width: 100%;">
                ${images.map((img, idx) => `
                    <img class="gallery-thumb" data-index="${idx}" src="${img.image_url}" alt="Thumbnail ${idx + 1}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; cursor: pointer; border: ${idx === 0 ? '3px solid #10b981' : '3px solid transparent'}; opacity: ${idx === 0 ? '1' : '0.6'}; transition: all 0.2s; flex-shrink: 0;">
                `).join('')}
            </div>
        ` : ''}
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    modal.querySelector('.gallery-close').addEventListener('click', () => {
        modal.remove();
        document.body.style.overflow = '';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    });

    const prevBtn = modal.querySelector('.gallery-prev');
    const nextBtn = modal.querySelector('.gallery-next');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateGallery();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            updateGallery();
        });
    }

    modal.querySelectorAll('.gallery-thumb').forEach(thumb => {
        thumb.addEventListener('click', (e) => {
            currentIndex = parseInt(e.currentTarget.dataset.index);
            updateGallery();
        });
    });

    document.addEventListener('keydown', function handleKeydown(e) {
        if (!document.body.contains(modal)) {
            document.removeEventListener('keydown', handleKeydown);
            return;
        }
        if (e.key === 'Escape') {
            modal.remove();
            document.body.style.overflow = '';
        } else if (e.key === 'ArrowLeft' && images.length > 1) {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateGallery();
        } else if (e.key === 'ArrowRight' && images.length > 1) {
            currentIndex = (currentIndex + 1) % images.length;
            updateGallery();
        }
    });
}

function addToCart(product, quantity) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity = quantity;
    } else {
        cart.push({ ...product, quantity });
    }

    updateCartBadge();
    renderTabContent();
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const mobileBadge = document.querySelector('.mobile-cart-badge');
    if (cart.length > 0) {
        badge.textContent = cart.length;
        badge.style.display = 'inline-block';
        if (mobileBadge) {
            mobileBadge.textContent = cart.length;
            mobileBadge.style.display = 'inline-block';
        }
    } else {
        badge.style.display = 'none';
        if (mobileBadge) {
            mobileBadge.style.display = 'none';
        }
    }
}

async function renderCartTab(container) {
    const { data: existingDebt } = await supabaseClient
        .from('orders')
        .select('id, debt_amount, order_number')
        .eq('client_id', profile.id)
        .gt('debt_amount', 0)
        .limit(1)
        .maybeSingle();

    const hasUnpaidDebt = existingDebt && existingDebt.debt_amount > 0;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="card">
                ${hasUnpaidDebt ? `
                    <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 12px; color: #991b1b;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <div>
                                <div style="font-weight: 600;">У вас есть неоплаченный заказ</div>
                                <div style="font-size: 13px;">Заказ ${existingDebt.order_number} - долг ${existingDebt.debt_amount.toFixed(2)} сум. Оплатите его перед новым заказом.</div>
                            </div>
                        </div>
                    </div>
                ` : ''}
                <div style="text-align: center; padding: 60px 20px; color: var(--text-gray);">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 20px;">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <p style="font-size: 18px;">Корзина пуста</p>
                </div>
            </div>
        `;
        return;
    }

    let totalOriginal = 0;
    let totalDiscounted = 0;
    let orderDiscount = 0;

    cart.forEach(item => {
        const originalPrice = item.price * item.quantity;
        const discountedPrice = (item.discountedPrice || item.price) * item.quantity;
        totalOriginal += originalPrice;
        totalDiscounted += discountedPrice;
    });

    const orderPromos = activePromotions.filter(p => p.type === 'order' && totalDiscounted >= (p.min_order_amount || 0));
    if (orderPromos.length > 0) {
        const bestOrderPromo = orderPromos.sort((a, b) => b.priority - a.priority)[0];
        if (bestOrderPromo.discount_type === 'percentage') {
            orderDiscount = totalDiscounted * (bestOrderPromo.discount_value / 100);
        } else {
            orderDiscount = Math.min(bestOrderPromo.discount_value, totalDiscounted);
        }
    }

    const finalTotal = totalDiscounted - orderDiscount;
    const totalSavings = totalOriginal - finalTotal;

    container.innerHTML = `
        <div class="card">
            <h2 class="card-title mb-3">Корзина</h2>

            <div style="margin-bottom: 24px;">
                ${cart.map(item => {
                    const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;
                    const itemTotal = (item.discountedPrice || item.price) * item.quantity;
                    return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-light); border-radius: 8px; margin-bottom: 12px;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-dark); margin-bottom: 4px;">
                                ${item.name}
                                ${hasDiscount ? '<span style="background: #f97316; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 8px;">АКЦИЯ</span>' : ''}
                            </div>
                            <div style="font-size: 14px; color: var(--text-gray);">
                                ${hasDiscount ? `
                                    <span style="text-decoration: line-through;">${item.price.toFixed(2)}</span>
                                    <span style="color: #f97316; font-weight: 600;">${item.discountedPrice.toFixed(2)} сум</span>
                                ` : `${item.price.toFixed(2)} сум`}
                                × ${item.quantity} = <strong>${itemTotal.toFixed(2)} сум</strong>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <button class="quantity-btn" data-action="cart-decrease" data-product-id="${item.id}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                            <span style="font-weight: 600; min-width: 30px; text-align: center;">${item.quantity}</span>
                            <button class="quantity-btn" data-action="cart-increase" data-product-id="${item.id}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                            <button class="btn btn-danger" data-action="remove-from-cart" data-product-id="${item.id}" style="padding: 8px 12px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;}).join('')}
            </div>

            <div style="border-top: 2px solid var(--border-color); padding-top: 20px;">
                ${totalSavings > 0 ? `
                    <div style="background: #fef3c7; border: 1px solid #fde68a; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #92400e; font-weight: 600;">Ваша экономия:</span>
                            <span style="color: #f97316; font-weight: 700; font-size: 18px;">-${totalSavings.toFixed(2)} сум</span>
                        </div>
                        ${orderDiscount > 0 ? `<div style="font-size: 12px; color: #92400e; margin-top: 4px;">Включая скидку на чек: -${orderDiscount.toFixed(2)} сум</div>` : ''}
                    </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; margin-bottom: 20px;">
                    <span>Итого:</span>
                    <span>${finalTotal.toFixed(2)} сум</span>
                </div>
                ${hasUnpaidDebt ? `
                    <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; gap: 12px; color: #991b1b;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <div>
                                <div style="font-weight: 600;">Оформление недоступно</div>
                                <div style="font-size: 13px;">Сначала оплатите заказ ${existingDebt.order_number} (долг: ${existingDebt.debt_amount.toFixed(2)} сум)</div>
                            </div>
                        </div>
                    </div>
                ` : ''}
                <button class="btn btn-primary" id="place-order-btn" style="width: 100%; padding: 16px;" ${profile.is_blocked || hasUnpaidDebt ? 'disabled' : ''}>
                    ${profile.is_blocked ? 'Аккаунт заблокирован' : hasUnpaidDebt ? 'Оплатите предыдущий заказ' : 'Оформить заказ'}
                </button>
            </div>
        </div>
    `;

    setupCartHandlers();
}

function setupCartHandlers() {
    document.querySelectorAll('[data-action="cart-decrease"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            const item = cart.find(i => i.id === productId);
            if (item.quantity > 1) {
                item.quantity--;
                renderTabContent();
            }
        });
    });

    document.querySelectorAll('[data-action="cart-increase"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            const item = cart.find(i => i.id === productId);
            if (item.quantity < item.stock_quantity) {
                item.quantity++;
                renderTabContent();
            } else {
                alert('Недостаточно товара на складе');
            }
        });
    });

    document.querySelectorAll('[data-action="remove-from-cart"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            cart = cart.filter(item => item.id !== productId);
            updateCartBadge();
            renderTabContent();
        });
    });

    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }
}

async function placeOrder() {
    if (cart.length === 0) return;

    const btn = document.getElementById('place-order-btn');
    btn.disabled = true;
    btn.textContent = 'Оформление...';

    try {
        const { data: currentProfile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', profile.id)
            .maybeSingle();

        if (!currentProfile) {
            throw new Error('Профиль не найден');
        }

        if (currentProfile.is_blocked) {
            const blockedUntil = currentProfile.blocked_until ? new Date(currentProfile.blocked_until) : null;
            if (!blockedUntil || blockedUntil > new Date()) {
                throw new Error('Ваш аккаунт заблокирован. Обратитесь к администратору.');
            }
        }

        const productIds = cart.map(item => item.id);
        const { data: currentProducts, error: productsError } = await supabaseClient
            .from('products')
            .select('id, name, stock_quantity, unit_type')
            .in('id', productIds);

        if (productsError) throw productsError;

        for (const cartItem of cart) {
            const product = currentProducts.find(p => p.id === cartItem.id);
            if (!product) {
                throw new Error(`Товар "${cartItem.name}" больше не доступен`);
            }
            if (product.stock_quantity < cartItem.quantity) {
                throw new Error(`Недостаточно товара "${product.name}" на складе. Пожалуйста, уменьшите количество.`);
            }
        }

        const orderNumber = `ORD-${Date.now()}`;

        let totalDiscounted = 0;
        cart.forEach(item => {
            totalDiscounted += (item.discountedPrice || item.price) * item.quantity;
        });

        const orderPromos = activePromotions.filter(p => p.type === 'order' && totalDiscounted >= (p.min_order_amount || 0));
        let orderDiscount = 0;
        if (orderPromos.length > 0) {
            const bestOrderPromo = orderPromos.sort((a, b) => b.priority - a.priority)[0];
            if (bestOrderPromo.discount_type === 'percentage') {
                orderDiscount = totalDiscounted * (bestOrderPromo.discount_value / 100);
            } else {
                orderDiscount = Math.min(bestOrderPromo.discount_value, totalDiscounted);
            }
        }

        const totalAmount = totalDiscounted - orderDiscount;
        const orderDate = new Date().toISOString();
        const paymentDueDays = profile.payment_due_days || 15;
        const paymentDueDate = new Date(Date.now() + paymentDueDays * 24 * 60 * 60 * 1000).toISOString();

        const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .insert({
                order_number: orderNumber,
                client_id: profile.id,
                total_amount: totalAmount,
                debt_amount: totalAmount,
                status: 'active',
                order_date: orderDate,
                payment_due_date: paymentDueDate,
            })
            .select()
            .maybeSingle();

        if (orderError) throw orderError;
        if (!order) throw new Error('Не удалось создать заказ');

        const orderItems = cart.map(item => ({
            order_id: order.id,
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.discountedPrice || item.price,
            subtotal: (item.discountedPrice || item.price) * item.quantity,
        }));

        const { error: itemsError } = await supabaseClient
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        try {
            const whatsappUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-whatsapp`;
            await fetch(whatsappUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderNumber: orderNumber,
                    clientName: profile.full_name || profile.email,
                    totalAmount: totalAmount,
                    itemsCount: cart.length
                })
            });
        } catch (whatsappError) {
            console.error('WhatsApp notification error:', whatsappError);
        }

        cart = [];
        updateCartBadge();

        alert('Заказ успешно оформлен!');
        currentTab = 'orders';
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelector('[data-tab="orders"]').classList.add('active');
        await renderTabContent();
    } catch (error) {
        console.error('Order error:', error);
        alert('Ошибка при оформлении заказа: ' + error.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Оформить заказ';
        }
    }
}

async function renderOrdersTab(container) {
    container.innerHTML = '<div class="spinner"></div>';

    const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('client_id', profile.id)
        .order('order_date', { ascending: false });

    if (error) {
        container.innerHTML = '<div class="alert alert-error">Ошибка загрузки заказов</div>';
        return;
    }

    orders = data || [];

    const totalDebt = orders.reduce((sum, order) => sum + (order.debt_amount || 0), 0);

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="card">
                <div style="text-align: center; padding: 60px 20px; color: var(--text-gray);">
                    <p style="font-size: 18px;">У вас пока нет заказов</p>
                </div>
            </div>
        `;
        return;
    }

    let blockInfoHtml = '';
    if (profile.is_blocked && profile.blocked_until) {
        const blockedUntil = new Date(profile.blocked_until);
        const now = new Date();
        const daysLeft = Math.ceil((blockedUntil - now) / (1000 * 60 * 60 * 24));
        blockInfoHtml = `
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                    <div style="width: 48px; height: 48px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <div style="flex: 1; min-width: 200px;">
                        <div style="font-size: 14px; color: #991b1b; margin-bottom: 4px; font-weight: 600;">
                            Аккаунт заблокирован
                        </div>
                        <div style="font-size: 24px; font-weight: 700; color: #dc2626;">
                            ${daysLeft > 0 ? daysLeft + ' дней' : 'Бессрочно'}
                        </div>
                        <div style="font-size: 13px; color: #991b1b; margin-top: 4px;">
                            ${daysLeft > 0 ? 'до ' + blockedUntil.toLocaleDateString() : ''}
                            ${profile.blocked_reason ? ' - ' + profile.blocked_reason : ''}
                        </div>
                    </div>
                    ${totalDebt > 0 ? `
                        <div style="text-align: right; min-width: 150px;">
                            <div style="font-size: 13px; color: #666;">Задолженность</div>
                            <div style="font-size: 20px; font-weight: 700; color: #dc2626;">${totalDebt.toFixed(2)} сум</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    } else if (totalDebt > 0) {
        blockInfoHtml = `
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 48px; height: 48px; background: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-size: 14px; color: #92400e; margin-bottom: 4px;">
                            Текущая задолженность
                        </div>
                        <div style="font-size: 28px; font-weight: 700; color: #d97706;">
                            ${totalDebt.toFixed(2)} сум
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        ${blockInfoHtml}

        <div class="card">
            <h2 class="card-title mb-3">История заказов</h2>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Номер заказа</th>
                            <th>Дата</th>
                            <th>Сумма</th>
                            <th>Долг</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => {
                            return `
                                <tr>
                                    <td>${order.order_number}</td>
                                    <td>${new Date(order.order_date).toLocaleDateString()}</td>
                                    <td>${order.total_amount.toFixed(2)} сум</td>
                                    <td style="${order.debt_amount > 0 ? 'color: #dc2626; font-weight: 600;' : 'color: #16a34a;'}">${order.debt_amount.toFixed(2)} сум</td>
                                    <td>
                                        ${order.status === 'paid' || order.debt_amount === 0
                                            ? '<span class="badge badge-success">Оплачен</span>'
                                            : '<span class="badge badge-warning">Активен</span>'
                                        }
                                    </td>
                                    <td>
                                        <button class="btn btn-secondary" onclick="window.exportOrderToExcel('${order.id}')">
                                            Экспорт Excel
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    window.exportOrderToExcel = async (orderId) => {
        await exportOrderToExcel(orderId);
    };
}

async function exportOrderToExcel(orderId) {
    try {
        const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .maybeSingle();

        if (orderError || !order) {
            alert('Ошибка загрузки заказа');
            return;
        }

        const { data: items, error: itemsError } = await supabaseClient
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);

        if (itemsError) {
            alert('Ошибка загрузки товаров');
            return;
        }

        const { data: payments, error: paymentsError } = await supabaseClient
            .from('payments')
            .select('*')
            .eq('order_id', orderId)
            .order('payment_date', { ascending: true });

        if (paymentsError) {
            alert('Ошибка загрузки платежей');
            return;
        }

        const { data: productsData } = await supabaseClient
            .from('products')
            .select('id, price')
            .in('id', items.map(i => i.product_id));

        const originalPrices = {};
        (productsData || []).forEach(p => { originalPrices[p.id] = p.price; });

        let originalTotal = 0;
        items.forEach(item => {
            const origPrice = originalPrices[item.product_id] || item.unit_price;
            originalTotal += origPrice * item.quantity;
        });

        const totalDiscount = originalTotal - order.total_amount;

        const workbook = window.XLSX.utils.book_new();

        const orderInfo = [
            ['НАКЛАДНАЯ'],
            [''],
            ['Номер заказа:', order.order_number],
            ['Дата заказа:', new Date(order.order_date).toLocaleDateString()],
            [''],
            ['ТОВАРЫ В ЗАКАЗЕ'],
            ['Название', 'Кол-во', 'Обычная цена', 'Цена со скидкой', 'Сумма']
        ];

        items.forEach(item => {
            const origPrice = originalPrices[item.product_id] || item.unit_price;
            const hasDiscount = origPrice > item.unit_price;
            orderInfo.push([
                item.product_name + (hasDiscount ? ' (СКИДКА)' : ''),
                item.quantity,
                origPrice.toFixed(2) + ' сум',
                hasDiscount ? item.unit_price.toFixed(2) + ' сум' : '-',
                item.subtotal.toFixed(2) + ' сум'
            ]);
        });

        orderInfo.push(['']);
        if (totalDiscount > 0) {
            orderInfo.push(['Сумма без скидки:', '', '', '', originalTotal.toFixed(2) + ' сум']);
            orderInfo.push(['Общая скидка:', '', '', '', '-' + totalDiscount.toFixed(2) + ' сум']);
        }
        orderInfo.push(['ИТОГО К ОПЛАТЕ:', '', '', '', order.total_amount.toFixed(2) + ' сум']);
        orderInfo.push(['Долг:', '', '', '', order.debt_amount.toFixed(2) + ' сум']);
        orderInfo.push(['Статус:', '', '', '', order.debt_amount === 0 ? 'Оплачен' : 'Активен']);

        orderInfo.push(['']);
        orderInfo.push(['ИСТОРИЯ ПЛАТЕЖЕЙ']);
        orderInfo.push(['Дата', 'Сумма', 'Описание', '', '']);

        if (payments && payments.length > 0) {
            payments.forEach(payment => {
                orderInfo.push([
                    new Date(payment.payment_date).toLocaleString(),
                    payment.amount.toFixed(2) + ' сум',
                    payment.note || 'Наличные',
                    '',
                    ''
                ]);
            });
        } else {
            orderInfo.push(['Платежи отсутствуют', '', '', '', '']);
        }

        const totalPaid = payments ? payments.reduce((sum, p) => sum + p.amount, 0) : 0;
        orderInfo.push(['']);
        orderInfo.push(['Итого оплачено:', totalPaid.toFixed(2) + ' сум', '', '', '']);
        orderInfo.push(['Остаток долга:', order.debt_amount.toFixed(2) + ' сум', '', '', '']);

        const worksheet = window.XLSX.utils.aoa_to_sheet(orderInfo);

        worksheet['!cols'] = [
            { wch: 35 },
            { wch: 12 },
            { wch: 18 },
            { wch: 18 },
            { wch: 18 }
        ];

        window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Заказ');

        window.XLSX.writeFile(workbook, `Накладная_${order.order_number}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Export error:', error);
        alert('Ошибка при экспорте: ' + error.message);
    }
}
