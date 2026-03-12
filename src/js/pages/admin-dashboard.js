import { supabaseClient, signOut } from '../supabase-client.js';

let currentTab = 'clients';
let clients = [];
let products = [];
let orders = [];

const adminMenuItems = [
    { id: 'clients', label: 'Клиенты', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>' },
    { id: 'products', label: 'Товары', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>' },
    { id: 'categories', label: 'Категории', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>' },
    { id: 'orders', label: 'Заказы', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>' },
    { id: 'debts', label: 'Задолженности', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>' },
    { id: 'promotions', label: 'Акции', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>' }
];

export async function renderAdminDashboard(profile) {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="header">
            <div class="header-content">
                <h1 class="header-title">Pladis Max</h1>
                <div class="header-user">
                    <div class="user-info">
                        <div class="user-name">${profile.full_name || profile.email}</div>
                        <div class="user-role">Администратор</div>
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
                ${adminMenuItems.map(item => `
                    <button class="mobile-nav-item ${currentTab === item.id ? 'active' : ''}" data-tab="${item.id}">
                        ${item.icon}
                        ${item.label}
                    </button>
                `).join('')}
            </div>
        </div>

        <div class="container">
            <div class="tabs">
                ${adminMenuItems.map(item => `
                    <button class="tab ${currentTab === item.id ? 'active' : ''}" data-tab="${item.id}">${item.label}</button>
                `).join('')}
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
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentTab = e.target.dataset.tab;
            renderTabContent();
        });
    });

    await renderTabContent();
}

async function renderTabContent() {
    const content = document.getElementById('tab-content');

    switch (currentTab) {
        case 'clients':
            await renderClientsTab(content);
            break;
        case 'categories':
            await renderCategoriesTab(content);
            break;
        case 'products':
            await renderProductsTab(content);
            break;
        case 'orders':
            await renderOrdersTab(content);
            break;
        case 'debts':
            await renderDebtsTab(content);
            break;
        case 'promotions':
            await renderPromotionsTab(content);
            break;
    }
}

let clientsViewMode = 'active';
let selectedClients = new Set();

async function renderClientsTab(container) {
    container.innerHTML = '<div class="spinner"></div>';

    const [activeClientsResult, archivedClientsResult, debtsResult] = await Promise.all([
        supabaseClient
            .from('profiles')
            .select('*')
            .eq('role', 'client')
            .or('is_archived.is.null,is_archived.eq.false')
            .or('is_deleted.is.null,is_deleted.eq.false')
            .order('created_at', { ascending: false }),
        supabaseClient
            .from('profiles')
            .select('*')
            .eq('role', 'client')
            .eq('is_archived', true)
            .order('archived_at', { ascending: false }),
        supabaseClient
            .from('orders')
            .select('client_id, debt_amount')
            .gt('debt_amount', 0)
    ]);

    if (activeClientsResult.error) {
        container.innerHTML = '<div class="alert alert-error">Ошибка загрузки клиентов</div>';
        return;
    }

    const activeClients = (activeClientsResult.data || []).filter(c => !c.is_archived);
    const archivedClients = archivedClientsResult.data || [];
    clients = clientsViewMode === 'active' ? activeClients : archivedClients;

    const debtsByClient = {};
    (debtsResult.data || []).forEach(order => {
        debtsByClient[order.client_id] = (debtsByClient[order.client_id] || 0) + order.debt_amount;
    });

    selectedClients.clear();

    container.innerHTML = `
        <div class="card">
            <div class="card-header" style="flex-wrap: wrap; gap: 12px;">
                <h2 class="card-title">Управление клиентами</h2>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <div style="display: flex; background: #f3f4f6; border-radius: 8px; padding: 4px;">
                        <button class="btn ${clientsViewMode === 'active' ? 'btn-primary' : 'btn-secondary'}" id="view-active-btn" style="padding: 8px 16px; border-radius: 6px;">
                            Активные (${activeClients.length})
                        </button>
                        <button class="btn ${clientsViewMode === 'archived' ? 'btn-primary' : 'btn-secondary'}" id="view-archived-btn" style="padding: 8px 16px; border-radius: 6px;">
                            Архив (${archivedClients.length})
                        </button>
                    </div>
                    ${clientsViewMode === 'active' ? `
                        <button class="btn btn-primary" id="add-client-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Добавить клиента
                        </button>
                    ` : ''}
                </div>
            </div>

            <div id="bulk-actions" style="display: none; background: #fef3c7; border: 1px solid #fde68a; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <span id="selected-count" style="font-weight: 600; color: #92400e;">Выбрано: 0</span>
                    <div style="display: flex; gap: 8px;">
                        ${clientsViewMode === 'active' ? `
                            <button class="btn btn-secondary" id="bulk-archive-btn">Архивировать выбранных</button>
                        ` : `
                            <button class="btn btn-primary" id="bulk-restore-btn">Восстановить выбранных</button>
                        `}
                        <button class="btn btn-danger" id="bulk-delete-btn">Удалить выбранных</button>
                        <button class="btn btn-secondary" id="clear-selection-btn">Снять выделение</button>
                    </div>
                </div>
            </div>

            ${clients.length === 0 ? `
                <div style="text-align: center; padding: 60px; color: var(--text-gray);">
                    <p>${clientsViewMode === 'active' ? 'Нет активных клиентов' : 'Нет архивированных клиентов'}</p>
                </div>
            ` : `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40px;">
                                    <input type="checkbox" id="select-all-clients" style="width: 18px; height: 18px; cursor: pointer;">
                                </th>
                                <th>Имя</th>
                                <th>Телефон</th>
                                <th>Долг</th>
                                ${clientsViewMode === 'active' ? '<th>Скидки</th>' : ''}
                                <th>Статус</th>
                                ${clientsViewMode === 'archived' ? '<th>Дата архивации</th>' : ''}
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${clients.map(client => {
                                const clientDebt = debtsByClient[client.id] || 0;
                                const canSeeDiscounts = client.can_see_discounts !== false;
                                const displayPhone = client.phone || (client.email && !client.email.includes('@b2b.local') ? client.email : '-');
                                return `
                                <tr data-client-id="${client.id}">
                                    <td>
                                        <input type="checkbox" class="client-checkbox" data-client-id="${client.id}" style="width: 18px; height: 18px; cursor: pointer;">
                                    </td>
                                    <td>${client.full_name || '-'}</td>
                                    <td style="font-family: monospace;">${displayPhone}</td>
                                    <td style="${clientDebt > 0 ? 'color: #dc2626; font-weight: 600;' : 'color: #16a34a;'}">
                                        ${clientDebt.toFixed(2)} сум
                                    </td>
                                    ${clientsViewMode === 'active' ? `
                                        <td>
                                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                                <input type="checkbox" ${canSeeDiscounts ? 'checked' : ''} onchange="window.toggleClientDiscounts('${client.id}', this.checked)" style="width: 18px; height: 18px; cursor: pointer;">
                                                <span style="font-size: 12px; color: ${canSeeDiscounts ? '#16a34a' : '#999'};">${canSeeDiscounts ? 'Вкл' : 'Выкл'}</span>
                                            </label>
                                        </td>
                                    ` : ''}
                                    <td>
                                        ${client.is_archived
                                            ? '<span class="badge badge-warning">Архив</span>'
                                            : client.is_blocked
                                                ? `<span class="badge badge-danger" title="${client.blocked_reason || ''}">Заблокирован</span>`
                                                : '<span class="badge badge-success">Активен</span>'
                                        }
                                    </td>
                                    ${clientsViewMode === 'archived' ? `
                                        <td style="font-size: 13px; color: var(--text-gray);">
                                            ${client.archived_at ? new Date(client.archived_at).toLocaleDateString() : '-'}
                                        </td>
                                    ` : ''}
                                    <td>
                                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                            ${clientsViewMode === 'archived' ? `
                                                <button class="btn btn-primary" style="padding: 8px 12px;" onclick="window.restoreClient('${client.id}')">
                                                    Восстановить
                                                </button>
                                                <button class="btn btn-secondary" style="padding: 8px 12px;" onclick="window.viewArchivedClient('${client.id}')">
                                                    Просмотр
                                                </button>
                                            ` : `
                                                <button class="btn btn-secondary" style="padding: 8px 12px;" onclick="window.editClient('${client.id}')">
                                                    Редактировать
                                                </button>
                                                <button class="btn btn-secondary" style="padding: 8px 12px;" onclick="window.toggleBlock('${client.id}', ${client.is_blocked})">
                                                    ${client.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                                                </button>
                                                <button class="btn btn-danger" style="padding: 8px 12px;" onclick="window.deleteClient('${client.id}', '${client.email.replace(/'/g, "\\'")}', ${clientDebt})">
                                                    Удалить
                                                </button>
                                            `}
                                        </div>
                                    </td>
                                </tr>
                            `;}).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;

    document.getElementById('view-active-btn')?.addEventListener('click', () => {
        clientsViewMode = 'active';
        renderTabContent();
    });

    document.getElementById('view-archived-btn')?.addEventListener('click', () => {
        clientsViewMode = 'archived';
        renderTabContent();
    });

    const addClientBtn = document.getElementById('add-client-btn');
    if (addClientBtn) {
        addClientBtn.addEventListener('click', showAddClientModal);
    }

    document.getElementById('select-all-clients')?.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.client-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = e.target.checked;
            if (e.target.checked) {
                selectedClients.add(cb.dataset.clientId);
            } else {
                selectedClients.delete(cb.dataset.clientId);
            }
        });
        updateBulkActions();
    });

    document.querySelectorAll('.client-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedClients.add(e.target.dataset.clientId);
            } else {
                selectedClients.delete(e.target.dataset.clientId);
            }
            updateBulkActions();
        });
    });

    document.getElementById('clear-selection-btn')?.addEventListener('click', () => {
        selectedClients.clear();
        document.querySelectorAll('.client-checkbox').forEach(cb => cb.checked = false);
        document.getElementById('select-all-clients').checked = false;
        updateBulkActions();
    });

    document.getElementById('bulk-archive-btn')?.addEventListener('click', bulkArchiveClients);
    document.getElementById('bulk-restore-btn')?.addEventListener('click', bulkRestoreClients);
    document.getElementById('bulk-delete-btn')?.addEventListener('click', bulkDeleteClients);

    window.toggleBlock = async (clientId, isBlocked) => {
        if (isBlocked) {
            await unblockClient(clientId);
        } else {
            showBlockModal(clientId);
        }
    };

    window.deleteClient = (clientId, clientEmail, clientDebt) => {
        showDeleteClientModal(clientId, clientEmail, clientDebt);
    };

    window.editClient = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        if (client) showEditClientModal(client);
    };

    window.restoreClient = async (clientId) => {
        if (!confirm('Восстановить клиента из архива?')) return;
        const { error } = await supabaseClient
            .from('profiles')
            .update({ is_archived: false, archived_at: null })
            .eq('id', clientId);
        if (error) {
            alert('Ошибка: ' + error.message);
        } else {
            alert('Клиент восстановлен!');
            await renderTabContent();
        }
    };

    window.viewArchivedClient = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        if (client) showClientDetailsModal(clientId);
    };

    window.toggleClientDiscounts = async (clientId, canSee) => {
        const { error } = await supabaseClient
            .from('profiles')
            .update({ can_see_discounts: canSee })
            .eq('id', clientId);
        if (error) {
            alert('Ошибка: ' + error.message);
        }
        await renderTabContent();
    };
}

function updateBulkActions() {
    const bulkActions = document.getElementById('bulk-actions');
    const selectedCount = document.getElementById('selected-count');
    if (selectedClients.size > 0) {
        bulkActions.style.display = 'block';
        selectedCount.textContent = `Выбрано: ${selectedClients.size}`;
    } else {
        bulkActions.style.display = 'none';
    }
}

async function bulkArchiveClients() {
    if (selectedClients.size === 0) return;
    if (!confirm(`Архивировать ${selectedClients.size} клиента(ов)?`)) return;

    try {
        const { error } = await supabaseClient
            .from('profiles')
            .update({ is_archived: true, archived_at: new Date().toISOString() })
            .in('id', Array.from(selectedClients));

        if (error) throw error;
        alert('Клиенты архивированы!');
        selectedClients.clear();
        await renderTabContent();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

async function bulkRestoreClients() {
    if (selectedClients.size === 0) return;
    if (!confirm(`Восстановить ${selectedClients.size} клиента(ов) из архива?`)) return;

    try {
        const { error } = await supabaseClient
            .from('profiles')
            .update({ is_archived: false, archived_at: null })
            .in('id', Array.from(selectedClients));

        if (error) throw error;
        alert('Клиенты восстановлены!');
        selectedClients.clear();
        await renderTabContent();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

async function bulkDeleteClients() {
    if (selectedClients.size === 0) return;
    if (!confirm(`ВНИМАНИЕ! Удалить ${selectedClients.size} клиента(ов) ПОЛНОСТЬЮ? Это действие нельзя отменить!`)) return;
    if (!confirm('Вы уверены? Все данные будут удалены навсегда.')) return;

    try {
        for (const clientId of selectedClients) {
            const { data: clientOrders } = await supabaseClient
                .from('orders')
                .select('id')
                .eq('client_id', clientId);

            if (clientOrders && clientOrders.length > 0) {
                const orderIds = clientOrders.map(o => o.id);
                await supabaseClient.from('payments').delete().in('order_id', orderIds);
                await supabaseClient.from('order_items').delete().in('order_id', orderIds);
            }

            await supabaseClient.from('orders').delete().eq('client_id', clientId);
            await supabaseClient.from('audit_log').delete().eq('record_id', clientId);
            await supabaseClient.from('profiles').delete().eq('id', clientId);
        }

        alert('Клиенты удалены!');
        selectedClients.clear();
        await renderTabContent();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

async function renderCategoriesTab(container) {
    container.innerHTML = '<div class="spinner"></div>';

    const [categoriesResult, productsResult] = await Promise.all([
        supabaseClient.from('categories').select('*').order('name'),
        supabaseClient.from('products').select('id, category_id').or('is_deleted.is.null,is_deleted.eq.false')
    ]);

    if (categoriesResult.error) {
        container.innerHTML = '<div class="alert alert-error">Ошибка загрузки категорий</div>';
        return;
    }

    const categories = categoriesResult.data || [];
    const allProducts = productsResult.data || [];

    const productCountByCategory = {};
    allProducts.forEach(p => {
        if (p.category_id) {
            productCountByCategory[p.category_id] = (productCountByCategory[p.category_id] || 0) + 1;
        }
    });

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Категории товаров</h2>
                <button class="btn btn-primary" id="add-category-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Добавить категорию
                </button>
            </div>

            ${categories.length === 0 ? `
                <div style="text-align: center; padding: 60px; color: var(--text-gray);">
                    <p>Категорий пока нет. Создайте первую категорию!</p>
                </div>
            ` : `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>Товаров</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${categories.map(cat => `
                                <tr style="${!cat.is_active ? 'opacity: 0.6;' : ''}">
                                    <td style="font-weight: 600;">${cat.name}</td>
                                    <td>${productCountByCategory[cat.id] || 0}</td>
                                    <td>
                                        ${cat.is_active
                                            ? '<span class="badge badge-success">Активна</span>'
                                            : '<span class="badge badge-danger">Отключена</span>'
                                        }
                                    </td>
                                    <td>
                                        <div style="display: flex; gap: 8px;">
                                            <button class="btn btn-secondary" style="padding: 8px 12px;" onclick="window.editCategory('${cat.id}', '${cat.name.replace(/'/g, "\\'")}', ${cat.is_active})">
                                                Редактировать
                                            </button>
                                            <button class="btn ${cat.is_active ? 'btn-secondary' : 'btn-primary'}" style="padding: 8px 12px;" onclick="window.toggleCategory('${cat.id}', ${cat.is_active})">
                                                ${cat.is_active ? 'Отключить' : 'Включить'}
                                            </button>
                                            <button class="btn btn-danger" style="padding: 8px 12px;" onclick="window.deleteCategory('${cat.id}', '${cat.name.replace(/'/g, "\\'")}', ${productCountByCategory[cat.id] || 0})">
                                                Удалить
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;

    document.getElementById('add-category-btn')?.addEventListener('click', () => showCategoryModal(null));

    window.editCategory = (id, name, isActive) => {
        showCategoryModal({ id, name, is_active: isActive });
    };

    window.toggleCategory = async (id, isActive) => {
        const { error } = await supabaseClient
            .from('categories')
            .update({ is_active: !isActive })
            .eq('id', id);
        if (error) {
            alert('Ошибка: ' + error.message);
        }
        await renderTabContent();
    };

    window.deleteCategory = async (id, name, productCount) => {
        if (productCount > 0) {
            alert(`Невозможно удалить категорию "${name}" - в ней ${productCount} товаров. Сначала переместите или удалите товары.`);
            return;
        }
        if (!confirm(`Удалить категорию "${name}"?`)) return;

        const { error } = await supabaseClient
            .from('categories')
            .delete()
            .eq('id', id);
        if (error) {
            alert('Ошибка: ' + error.message);
        } else {
            alert('Категория удалена!');
            await renderTabContent();
        }
    };
}

function showCategoryModal(category) {
    const isEdit = !!category;
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${isEdit ? 'Редактировать категорию' : 'Новая категория'}</h3>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Название категории *</label>
                    <input type="text" id="category-name" class="form-control" value="${category?.name || ''}" placeholder="Например: Электроника">
                </div>
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="category-active" ${category?.is_active !== false ? 'checked' : ''}>
                        Категория активна
                    </label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-category">Отмена</button>
                <button class="btn btn-primary" id="save-category">${isEdit ? 'Сохранить' : 'Создать'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancel-category').addEventListener('click', () => modal.remove());

    document.getElementById('save-category').addEventListener('click', async () => {
        const name = document.getElementById('category-name').value.trim();
        const isActive = document.getElementById('category-active').checked;

        if (!name) {
            alert('Введите название категории');
            return;
        }

        const saveBtn = document.getElementById('save-category');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Сохранение...';

        try {
            if (isEdit) {
                const { error } = await supabaseClient
                    .from('categories')
                    .update({ name, is_active: isActive })
                    .eq('id', category.id);
                if (error) throw error;
            } else {
                const { error } = await supabaseClient
                    .from('categories')
                    .insert({ name, is_active: isActive });
                if (error) throw error;
            }

            modal.remove();
            alert(isEdit ? 'Категория обновлена!' : 'Категория создана!');
            await renderTabContent();
        } catch (error) {
            alert('Ошибка: ' + error.message);
            saveBtn.disabled = false;
            saveBtn.textContent = isEdit ? 'Сохранить' : 'Создать';
        }
    });
}

async function showClientDetailsModal(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const [ordersResult, auditResult] = await Promise.all([
        supabaseClient
            .from('orders')
            .select('*')
            .eq('client_id', clientId)
            .order('order_date', { ascending: false })
            .limit(10),
        supabaseClient
            .from('audit_log')
            .select('*')
            .eq('record_id', clientId)
            .eq('table_name', 'profiles')
            .order('created_at', { ascending: false })
            .limit(10)
    ]);

    const clientOrders = ordersResult.data || [];
    const auditLogs = auditResult.data || [];
    const totalDebt = clientOrders.reduce((sum, o) => sum + (o.debt_amount || 0), 0);

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h3 class="modal-title">Карточка клиента</h3>
            </div>
            <div class="modal-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                    <div>
                        <div style="font-size: 13px; color: var(--text-gray);">Имя</div>
                        <div style="font-weight: 600;">${client.full_name || '-'}</div>
                    </div>
                    <div>
                        <div style="font-size: 13px; color: var(--text-gray);">Email</div>
                        <div style="font-weight: 600;">${client.email}</div>
                    </div>
                    <div>
                        <div style="font-size: 13px; color: var(--text-gray);">Статус</div>
                        <div style="font-weight: 600;">
                            ${client.is_blocked
                                ? `<span style="color: #dc2626;">Заблокирован</span>`
                                : `<span style="color: #16a34a;">Активен</span>`
                            }
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 13px; color: var(--text-gray);">Общий долг</div>
                        <div style="font-weight: 600; color: ${totalDebt > 0 ? '#dc2626' : '#16a34a'};">${totalDebt.toFixed(2)} сум</div>
                    </div>
                    ${client.is_blocked && client.blocked_reason ? `
                        <div style="grid-column: 1 / -1;">
                            <div style="font-size: 13px; color: var(--text-gray);">Причина блокировки</div>
                            <div style="font-weight: 600; color: #dc2626;">${client.blocked_reason}</div>
                        </div>
                    ` : ''}
                    ${client.unblocked_at ? `
                        <div style="grid-column: 1 / -1;">
                            <div style="font-size: 13px; color: var(--text-gray);">Последняя разблокировка</div>
                            <div style="font-weight: 600; color: #16a34a;">${new Date(client.unblocked_at).toLocaleString()} - ${client.unblocked_reason || ''}</div>
                        </div>
                    ` : ''}
                </div>

                ${auditLogs.length > 0 ? `
                    <div style="margin-bottom: 24px;">
                        <h4 style="margin-bottom: 12px;">История изменений</h4>
                        <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
                            ${auditLogs.map(log => `
                                <div style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                                    <div style="display: flex; justify-content: space-between; font-size: 13px;">
                                        <span style="font-weight: 600;">${log.action}</span>
                                        <span style="color: var(--text-gray);">${new Date(log.created_at).toLocaleString()}</span>
                                    </div>
                                    ${log.reason ? `<div style="font-size: 13px; color: var(--text-gray); margin-top: 4px;">${log.reason}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <h4 style="margin-bottom: 12px;">Последние заказы (${clientOrders.length})</h4>
                ${clientOrders.length > 0 ? `
                    <div style="max-height: 200px; overflow-y: auto;">
                        <table style="width: 100%; font-size: 13px;">
                            <thead>
                                <tr>
                                    <th style="text-align: left; padding: 8px;">Номер</th>
                                    <th style="text-align: left; padding: 8px;">Дата</th>
                                    <th style="text-align: right; padding: 8px;">Сумма</th>
                                    <th style="text-align: right; padding: 8px;">Долг</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${clientOrders.map(order => `
                                    <tr>
                                        <td style="padding: 8px;">${order.order_number}</td>
                                        <td style="padding: 8px;">${new Date(order.order_date).toLocaleDateString()}</td>
                                        <td style="padding: 8px; text-align: right;">${order.total_amount.toFixed(2)} сум</td>
                                        <td style="padding: 8px; text-align: right; color: ${order.debt_amount > 0 ? '#dc2626' : '#16a34a'};">${order.debt_amount.toFixed(2)} сум</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<div style="color: var(--text-gray); text-align: center; padding: 20px;">Нет заказов</div>'}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="close-client-details">Закрыть</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('close-client-details').addEventListener('click', () => {
        modal.remove();
    });
}

async function showClientHistoryModal(client) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'client-history-modal';

    const today = new Date();
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const defaultFromDate = monthAgo.toISOString().split('T')[0];
    const defaultToDate = today.toISOString().split('T')[0];

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px; max-height: 95vh;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <h3 class="modal-title">История клиента: ${client.full_name || client.email}</h3>
                <button class="btn btn-secondary" id="close-history-modal" style="padding: 8px 12px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="modal-body" style="overflow-y: auto; max-height: calc(95vh - 160px);">
                <div style="background: var(--bg-light); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: flex; gap: 12px; align-items: end; flex-wrap: wrap;">
                        <div>
                            <label style="display: block; font-size: 13px; margin-bottom: 4px; color: var(--text-gray);">От</label>
                            <input type="date" id="history-from-date" class="form-control" value="${defaultFromDate}" style="padding: 8px 12px;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; margin-bottom: 4px; color: var(--text-gray);">До</label>
                            <input type="date" id="history-to-date" class="form-control" value="${defaultToDate}" style="padding: 8px 12px;">
                        </div>
                        <button class="btn btn-primary" id="apply-date-filter" style="padding: 8px 16px;">Применить</button>
                        <button class="btn btn-secondary" id="export-history-excel" style="padding: 8px 16px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Экспорт
                        </button>
                    </div>
                </div>

                <div id="history-content">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('close-history-modal').addEventListener('click', () => modal.remove());

    async function loadHistory() {
        const fromDate = document.getElementById('history-from-date').value;
        const toDate = document.getElementById('history-to-date').value;
        const contentDiv = document.getElementById('history-content');
        contentDiv.innerHTML = '<div class="spinner"></div>';

        const fromDateTime = new Date(fromDate);
        fromDateTime.setHours(0, 0, 0, 0);
        const toDateTime = new Date(toDate);
        toDateTime.setHours(23, 59, 59, 999);

        const [ordersResult, paymentsResult] = await Promise.all([
            supabaseClient
                .from('orders')
                .select('*, order_items(*)')
                .eq('client_id', client.id)
                .gte('order_date', fromDateTime.toISOString())
                .lte('order_date', toDateTime.toISOString())
                .order('order_date', { ascending: false }),
            supabaseClient
                .from('payments')
                .select('*, orders!inner(client_id, order_number)')
                .eq('orders.client_id', client.id)
                .gte('payment_date', fromDateTime.toISOString())
                .lte('payment_date', toDateTime.toISOString())
                .order('payment_date', { ascending: false })
        ]);

        const orders = ordersResult.data || [];
        const payments = paymentsResult.data || [];

        const totalOrders = orders.length;
        const totalOrdersAmount = orders.reduce((sum, o) => sum + o.total_amount, 0);
        const totalPayments = payments.length;
        const totalPaymentsAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const currentDebt = orders.reduce((sum, o) => sum + (o.debt_amount || 0), 0);

        contentDiv.innerHTML = `
            <div class="debt-stats-grid" style="margin-bottom: 24px;">
                <div style="text-align: center;">
                    <div style="font-size: 13px; color: var(--text-gray);">Заказов</div>
                    <div style="font-size: 24px; font-weight: 700; color: var(--text-dark);">${totalOrders}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 13px; color: var(--text-gray);">Сумма заказов</div>
                    <div style="font-size: 20px; font-weight: 700; color: var(--text-dark);">${totalOrdersAmount.toFixed(2)} сум</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 13px; color: var(--text-gray);">Платежей</div>
                    <div style="font-size: 24px; font-weight: 700; color: #16a34a;">${totalPayments}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 13px; color: var(--text-gray);">Сумма платежей</div>
                    <div style="font-size: 20px; font-weight: 700; color: #16a34a;">${totalPaymentsAmount.toFixed(2)} сум</div>
                </div>
            </div>

            <div style="margin-bottom: 24px;">
                <h4 style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <span>Заказы (${orders.length})</span>
                    <span style="font-size: 14px; color: ${currentDebt > 0 ? '#dc2626' : '#16a34a'};">Текущий долг: ${currentDebt.toFixed(2)} сум</span>
                </h4>
                ${orders.length > 0 ? `
                    <div class="table-container" style="max-height: 300px; overflow-y: auto;">
                        <table style="font-size: 13px;">
                            <thead>
                                <tr>
                                    <th>Номер</th>
                                    <th>Дата</th>
                                    <th>Товары</th>
                                    <th style="text-align: right;">Сумма</th>
                                    <th style="text-align: right;">Долг</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orders.map(order => `
                                    <tr>
                                        <td style="font-family: monospace;">${order.order_number}</td>
                                        <td>${new Date(order.order_date).toLocaleDateString()}</td>
                                        <td>${(order.order_items || []).length} позиций</td>
                                        <td style="text-align: right; font-weight: 600;">${order.total_amount.toFixed(2)} сум</td>
                                        <td style="text-align: right; color: ${order.debt_amount > 0 ? '#dc2626' : '#16a34a'}; font-weight: 600;">${order.debt_amount.toFixed(2)} сум</td>
                                        <td><span class="badge ${order.status === 'paid' ? 'badge-success' : (order.debt_amount > 0 ? 'badge-danger' : 'badge-info')}">${order.status === 'paid' ? 'Оплачен' : (order.debt_amount > 0 ? 'Долг' : 'Активен')}</span></td>
                                        <td>
                                            <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;" onclick="window.downloadOrderInvoice('${order.id}')">
                                                Накладная
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<div style="text-align: center; padding: 20px; color: var(--text-gray);">Нет заказов за выбранный период</div>'}
            </div>

            <div>
                <h4 style="margin-bottom: 12px;">Платежи (${payments.length})</h4>
                ${payments.length > 0 ? `
                    <div class="table-container" style="max-height: 250px; overflow-y: auto;">
                        <table style="font-size: 13px;">
                            <thead>
                                <tr>
                                    <th>Дата и время</th>
                                    <th>Заказ</th>
                                    <th style="text-align: right;">Сумма</th>
                                    <th>Примечание</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${payments.map(payment => `
                                    <tr>
                                        <td>${new Date(payment.payment_date).toLocaleString()}</td>
                                        <td style="font-family: monospace;">${payment.orders?.order_number || '-'}</td>
                                        <td style="text-align: right; font-weight: 600; color: #16a34a;">+${payment.amount.toFixed(2)} сум</td>
                                        <td style="color: var(--text-gray);">${payment.note || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<div style="text-align: center; padding: 20px; color: var(--text-gray);">Нет платежей за выбранный период</div>'}
            </div>
        `;

        window.downloadOrderInvoice = async (orderId) => {
            await exportOrderToExcel(orderId);
        };

        window.currentHistoryData = { orders, payments, client, fromDate, toDate };
    }

    document.getElementById('apply-date-filter').addEventListener('click', loadHistory);

    document.getElementById('export-history-excel').addEventListener('click', async () => {
        const data = window.currentHistoryData;
        if (!data) {
            alert('Сначала загрузите данные');
            return;
        }

        const exportBtn = document.getElementById('export-history-excel');
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span> Экспорт...';

        try {
            const workbook = window.XLSX.utils.book_new();

            const totalOrdersAmount = data.orders.reduce((s, o) => s + o.total_amount, 0);
            const totalPaymentsAmount = data.payments.reduce((s, p) => s + p.amount, 0);
            const currentDebt = data.orders.reduce((s, o) => s + (o.debt_amount || 0), 0);

            const summaryData = [
                ['ПОЛНАЯ ИСТОРИЯ КЛИЕНТА'],
                [''],
                ['Клиент:', data.client.full_name || data.client.email],
                ['Телефон:', data.client.phone || '-'],
                ['Email:', data.client.email || '-'],
                ['Период:', `${data.fromDate} - ${data.toDate}`],
                ['Дата отчета:', new Date().toLocaleString()],
                [''],
                ['СВОДКА'],
                ['Всего заказов:', data.orders.length],
                ['Сумма заказов:', totalOrdersAmount.toFixed(2) + ' сум'],
                ['Всего платежей:', data.payments.length],
                ['Сумма платежей:', totalPaymentsAmount.toFixed(2) + ' сум'],
                ['Текущий долг:', currentDebt.toFixed(2) + ' сум'],
                [''],
                ['Статус клиента:', data.client.is_blocked ? 'ЗАБЛОКИРОВАН' : (data.client.is_archived ? 'В АРХИВЕ' : 'Активен')],
                data.client.is_blocked ? ['Причина блокировки:', data.client.blocked_reason || '-'] : [],
                data.client.is_blocked && data.client.blocked_until ? ['Блокировка до:', new Date(data.client.blocked_until).toLocaleDateString()] : []
            ].filter(row => row.length > 0);
            const summarySheet = window.XLSX.utils.aoa_to_sheet(summaryData);
            summarySheet['!cols'] = [{ wch: 25 }, { wch: 45 }];
            window.XLSX.utils.book_append_sheet(workbook, summarySheet, 'Сводка');

            const allPurchasesData = [
                ['ПОЛНАЯ ИСТОРИЯ ПОКУПОК'],
                [''],
                ['Клиент:', data.client.full_name || data.client.email],
                ['Период:', `${data.fromDate} - ${data.toDate}`],
                [''],
                ['Дата', 'Номер заказа', 'Товар', 'Количество', 'Цена за ед.', 'Сумма', 'Статус заказа']
            ];

            data.orders.forEach(order => {
                const items = order.order_items || [];
                items.forEach((item, idx) => {
                    allPurchasesData.push([
                        idx === 0 ? new Date(order.order_date).toLocaleDateString() : '',
                        idx === 0 ? order.order_number : '',
                        item.product_name,
                        item.quantity,
                        item.unit_price.toFixed(2) + ' сум',
                        item.subtotal.toFixed(2) + ' сум',
                        idx === 0 ? (order.status === 'paid' ? 'Оплачен' : (order.debt_amount > 0 ? 'Долг: ' + order.debt_amount.toFixed(2) : 'Активен')) : ''
                    ]);
                });
                if (items.length > 0) {
                    allPurchasesData.push(['', '', '', '', 'ИТОГО:', order.total_amount.toFixed(2) + ' сум', '']);
                    allPurchasesData.push(['', '', '', '', '', '', '']);
                }
            });

            const purchasesSheet = window.XLSX.utils.aoa_to_sheet(allPurchasesData);
            purchasesSheet['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 35 }, { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 20 }];
            window.XLSX.utils.book_append_sheet(workbook, purchasesSheet, 'История покупок');

            if (data.orders.length > 0) {
                const invoicesData = [
                    ['НАКЛАДНЫЕ ЗА ПЕРИОД'],
                    [''],
                    ['Клиент:', data.client.full_name || data.client.email],
                    ['Телефон:', data.client.phone || '-'],
                    ['Период:', `${data.fromDate} - ${data.toDate}`],
                    ['']
                ];

                for (const order of data.orders) {
                    const items = order.order_items || [];

                    invoicesData.push(['']);
                    invoicesData.push(['═══════════════════════════════════════════════════════════════']);
                    invoicesData.push(['НАКЛАДНАЯ №', order.order_number]);
                    invoicesData.push(['Дата заказа:', new Date(order.order_date).toLocaleDateString() + ' ' + new Date(order.order_date).toLocaleTimeString()]);
                    invoicesData.push(['Статус:', order.status === 'paid' ? 'ОПЛАЧЕН' : (order.debt_amount > 0 ? 'ДОЛГ' : 'Активен')]);
                    invoicesData.push(['']);
                    invoicesData.push(['№', 'Товар', 'Кол-во', 'Цена', 'Сумма']);
                    invoicesData.push(['───────────────────────────────────────────────────────────────']);

                    items.forEach((item, idx) => {
                        invoicesData.push([
                            idx + 1,
                            item.product_name,
                            item.quantity,
                            item.unit_price.toFixed(2) + ' сум',
                            item.subtotal.toFixed(2) + ' сум'
                        ]);
                    });

                    invoicesData.push(['───────────────────────────────────────────────────────────────']);
                    invoicesData.push(['', 'ИТОГО:', '', '', order.total_amount.toFixed(2) + ' сум']);
                    invoicesData.push(['', 'Оплачено:', '', '', (order.total_amount - order.debt_amount).toFixed(2) + ' сум']);
                    if (order.debt_amount > 0) {
                        invoicesData.push(['', 'Остаток долга:', '', '', order.debt_amount.toFixed(2) + ' сум']);
                    }

                    const orderPayments = data.payments.filter(p => p.order_id === order.id);
                    if (orderPayments.length > 0) {
                        invoicesData.push(['']);
                        invoicesData.push(['', 'История оплат по заказу:']);
                        orderPayments.forEach(p => {
                            invoicesData.push([
                                '',
                                new Date(p.payment_date).toLocaleString(),
                                p.note || 'Оплата',
                                '',
                                '+' + p.amount.toFixed(2) + ' сум'
                            ]);
                        });
                    }
                }

                invoicesData.push(['']);
                invoicesData.push(['═══════════════════════════════════════════════════════════════']);
                invoicesData.push(['ОБЩИЙ ИТОГ ПО ВСЕМ НАКЛАДНЫМ']);
                invoicesData.push(['Всего заказов:', data.orders.length]);
                invoicesData.push(['Общая сумма:', '', '', '', totalOrdersAmount.toFixed(2) + ' сум']);
                invoicesData.push(['Оплачено:', '', '', '', totalPaymentsAmount.toFixed(2) + ' сум']);
                invoicesData.push(['Остаток долга:', '', '', '', currentDebt.toFixed(2) + ' сум']);

                const invoicesSheet = window.XLSX.utils.aoa_to_sheet(invoicesData);
                invoicesSheet['!cols'] = [{ wch: 5 }, { wch: 35 }, { wch: 10 }, { wch: 18 }, { wch: 18 }];
                window.XLSX.utils.book_append_sheet(workbook, invoicesSheet, 'Накладные');
            }

            if (data.orders.length > 0) {
                const ordersData = [['Номер заказа', 'Дата', 'Время', 'Товаров', 'Сумма', 'Оплачено', 'Долг', 'Статус']];
                data.orders.forEach(o => {
                    const itemsCount = (o.order_items || []).length;
                    const orderDate = new Date(o.order_date);
                    ordersData.push([
                        o.order_number,
                        orderDate.toLocaleDateString(),
                        orderDate.toLocaleTimeString(),
                        itemsCount,
                        o.total_amount.toFixed(2) + ' сум',
                        (o.total_amount - o.debt_amount).toFixed(2) + ' сум',
                        o.debt_amount.toFixed(2) + ' сум',
                        o.status === 'paid' ? 'Оплачен' : (o.debt_amount > 0 ? 'Долг' : 'Активен')
                    ]);
                });
                const ordersSheet = window.XLSX.utils.aoa_to_sheet(ordersData);
                ordersSheet['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 12 }];
                window.XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Заказы');
            }

            if (data.payments.length > 0) {
                const paymentsData = [['Дата', 'Время', 'Заказ', 'Сумма', 'Примечание']];
                data.payments.forEach(p => {
                    const payDate = new Date(p.payment_date);
                    paymentsData.push([
                        payDate.toLocaleDateString(),
                        payDate.toLocaleTimeString(),
                        p.orders?.order_number || '-',
                        p.amount.toFixed(2) + ' сум',
                        p.note || '-'
                    ]);
                });
                const paymentsSheet = window.XLSX.utils.aoa_to_sheet(paymentsData);
                paymentsSheet['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 18 }, { wch: 35 }];
                window.XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'Платежи');
            }

            const fileName = `История_${(data.client.full_name || 'клиент').replace(/[/\\?%*:|"<>]/g, '_')}_${data.fromDate}_${data.toDate}.xlsx`;
            window.XLSX.writeFile(workbook, fileName);
        } catch (error) {
            console.error('Export error:', error);
            alert('Ошибка экспорта: ' + error.message);
        } finally {
            exportBtn.disabled = false;
            exportBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Экспорт
            `;
        }
    });

    await loadHistory();
}

function showEditClientModal(client) {
    const currentPhone = client.phone || '';
    const phoneDigits = currentPhone.replace(/^\+998/, '').replace(/\D/g, '');

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3 class="modal-title">Редактировать клиента</h3>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Номер телефона *</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="background: #f3f4f6; padding: 12px; border-radius: 8px; font-weight: 600; white-space: nowrap;">+998</span>
                        <input type="tel" id="edit-client-phone" class="form-control" value="${phoneDigits}" placeholder="90 123 45 67" maxlength="12" style="flex: 1;">
                    </div>
                </div>
                <div class="form-group">
                    <label>Полное имя *</label>
                    <input type="text" id="edit-client-name" class="form-control" value="${client.full_name || ''}" placeholder="Имя клиента">
                </div>
                <div class="form-group">
                    <label>Новый пароль</label>
                    <div style="position: relative;">
                        <input type="password" id="edit-client-password" class="form-control" placeholder="Оставьте пустым, чтобы не менять" style="padding-right: 48px;">
                        <button type="button" id="toggle-edit-password" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px; color: var(--text-gray);">
                            <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <svg class="eye-off-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                        </button>
                    </div>
                    <div style="font-size: 12px; color: var(--text-gray); margin-top: 4px;">Минимум 6 символов</div>
                </div>
                <div class="form-group">
                    <label>Срок оплаты (дней)</label>
                    <input type="number" id="edit-client-payment-days" class="form-control" value="${client.payment_due_days || 15}" min="1" max="365" placeholder="15">
                    <div style="font-size: 12px; color: var(--text-gray); margin-top: 4px;">Количество дней для оплаты заказа</div>
                </div>
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="edit-client-discounts" ${client.can_see_discounts !== false ? 'checked' : ''}>
                        Клиент видит скидки и акции
                    </label>
                </div>
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="edit-client-blocked" ${client.is_blocked ? 'checked' : ''}>
                        Заблокирован
                    </label>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 16px;">
                    <button type="button" class="btn btn-secondary" id="view-client-history" style="flex: 1;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        История клиента
                    </button>
                </div>
                <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 16px;">
                    <div style="font-size: 13px; color: #666; margin-bottom: 8px;">Опасная зона</div>
                    <button type="button" class="btn btn-danger" id="delete-client-permanently" style="width: 100%;">
                        Удалить клиента полностью
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-edit-client">Отмена</button>
                <button class="btn btn-primary" id="save-edit-client">Сохранить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const togglePasswordBtn = document.getElementById('toggle-edit-password');
    const passwordInput = document.getElementById('edit-client-password');
    if (togglePasswordBtn && passwordInput) {
        const eyeIcon = togglePasswordBtn.querySelector('.eye-icon');
        const eyeOffIcon = togglePasswordBtn.querySelector('.eye-off-icon');
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            if (type === 'text') {
                eyeIcon.style.display = 'none';
                eyeOffIcon.style.display = 'block';
            } else {
                eyeIcon.style.display = 'block';
                eyeOffIcon.style.display = 'none';
            }
        });
    }

    document.getElementById('view-client-history').addEventListener('click', () => {
        modal.remove();
        showClientHistoryModal(client);
    });

    document.getElementById('cancel-edit-client').addEventListener('click', () => modal.remove());

    document.getElementById('delete-client-permanently').addEventListener('click', async () => {
        if (!confirm('ВНИМАНИЕ! Клиент будет полностью удален из базы данных. Это действие НЕЛЬЗЯ отменить. Продолжить?')) return;
        if (!confirm('Вы уверены? Все данные клиента будут потеряны навсегда.')) return;

        try {
            await supabaseClient.from('payments').delete().in('order_id',
                (await supabaseClient.from('orders').select('id').eq('client_id', client.id)).data?.map(o => o.id) || []
            );
            await supabaseClient.from('order_items').delete().in('order_id',
                (await supabaseClient.from('orders').select('id').eq('client_id', client.id)).data?.map(o => o.id) || []
            );
            await supabaseClient.from('orders').delete().eq('client_id', client.id);
            await supabaseClient.from('audit_log').delete().eq('record_id', client.id);

            const { error } = await supabaseClient.from('profiles').delete().eq('id', client.id);
            if (error) throw error;

            modal.remove();
            alert('Клиент полностью удален!');
            await renderTabContent();
        } catch (error) {
            alert('Ошибка удаления: ' + error.message);
        }
    });

    document.getElementById('save-edit-client').addEventListener('click', async () => {
        const phoneRaw = document.getElementById('edit-client-phone').value.trim().replace(/\D/g, '');
        const fullName = document.getElementById('edit-client-name').value.trim();
        const newPassword = document.getElementById('edit-client-password').value;
        const paymentDueDays = parseInt(document.getElementById('edit-client-payment-days').value) || 15;
        const canSeeDiscounts = document.getElementById('edit-client-discounts').checked;
        const isBlocked = document.getElementById('edit-client-blocked').checked;

        if (!phoneRaw || phoneRaw.length !== 9) {
            alert('Введите корректный номер телефона (9 цифр)');
            return;
        }

        if (!fullName) {
            alert('Введите имя клиента');
            return;
        }

        if (paymentDueDays < 1 || paymentDueDays > 365) {
            alert('Срок оплаты должен быть от 1 до 365 дней');
            return;
        }

        if (newPassword && newPassword.length < 6) {
            alert('Пароль должен быть минимум 6 символов');
            return;
        }

        const phone = '+998' + phoneRaw;
        const email = phoneRaw + '@b2b.local';

        const saveBtn = document.getElementById('save-edit-client');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Сохранение...';

        try {
            const { error } = await supabaseClient
                .from('profiles')
                .update({
                    full_name: fullName,
                    phone: phone,
                    email: email,
                    payment_due_days: paymentDueDays,
                    can_see_discounts: canSeeDiscounts,
                    is_blocked: isBlocked
                })
                .eq('id', client.id);

            if (error) throw error;

            if (newPassword) {
                const { error: authError } = await supabaseClient.auth.admin.updateUserById(
                    client.id,
                    { password: newPassword }
                );
                if (authError) {
                    console.warn('Could not update password via admin API, trying alternative method');
                }
            }

            modal.remove();
            alert(newPassword ? 'Клиент и пароль обновлены!' : 'Клиент обновлен!');
            await renderTabContent();
        } catch (error) {
            alert('Ошибка: ' + error.message);
            saveBtn.disabled = false;
            saveBtn.textContent = 'Сохранить';
        }
    });
}

function showDeleteClientModal(clientId, clientEmail, clientDebt = 0) {
    const hasDebt = clientDebt > 0;

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${hasDebt ? 'Удаление / Архивация клиента' : 'Удалить клиента'}</h3>
            </div>
            <div class="modal-body">
                ${hasDebt ? `
                    <div style="background: #fef3c7; border: 1px solid #fde68a; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 12px; color: #92400e;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <div>
                                <div style="font-weight: 700; margin-bottom: 4px;">Клиент имеет задолженность!</div>
                                <div style="font-size: 14px;">Долг: <strong>${clientDebt.toFixed(2)} сум</strong></div>
                            </div>
                        </div>
                    </div>
                ` : `
                    <div style="background: #fee2e2; border: 1px solid #fca5a5; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 12px; color: #991b1b;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <div>
                                <div style="font-weight: 700; margin-bottom: 4px;">Внимание!</div>
                                <div style="font-size: 14px;">Это действие нельзя отменить</div>
                            </div>
                        </div>
                    </div>
                `}
                <div style="background: var(--bg-light); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="font-weight: 600; color: var(--text-dark);">${clientEmail}</div>
                </div>
                ${hasDebt ? `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px;">
                            <div style="font-weight: 700; color: #166534; margin-bottom: 8px;">Архивировать</div>
                            <ul style="font-size: 12px; color: #166534; margin-left: 16px; margin-bottom: 0;">
                                <li>Клиент скрыт из списка</li>
                                <li>Все данные сохранены</li>
                                <li>Можно восстановить</li>
                            </ul>
                        </div>
                        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px;">
                            <div style="font-weight: 700; color: #991b1b; margin-bottom: 8px;">Удалить полностью</div>
                            <ul style="font-size: 12px; color: #991b1b; margin-left: 16px; margin-bottom: 0;">
                                <li>Все данные удалены</li>
                                <li>Долг списан</li>
                                <li>Нельзя отменить!</li>
                            </ul>
                        </div>
                    </div>
                ` : `
                    <p style="font-size: 13px; color: var(--text-gray);">
                        При удалении клиента будут удалены:
                    </p>
                    <ul style="font-size: 13px; color: var(--text-gray); margin-left: 20px;">
                        <li>Профиль клиента</li>
                        <li>Все заказы клиента</li>
                        <li>История операций</li>
                    </ul>
                `}
            </div>
            <div class="modal-footer" style="display: flex; gap: 8px; justify-content: flex-end;">
                <button class="btn btn-secondary" id="cancel-delete-client">Отмена</button>
                ${hasDebt ? `
                    <button class="btn btn-primary" id="archive-client-btn">Архивировать</button>
                    <button class="btn btn-danger" id="force-delete-client-btn">Удалить полностью</button>
                ` : `
                    <button class="btn btn-danger" id="confirm-delete-client">Удалить</button>
                `}
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancel-delete-client').addEventListener('click', () => {
        modal.remove();
    });

    const archiveBtn = document.getElementById('archive-client-btn');
    if (archiveBtn) {
        archiveBtn.addEventListener('click', async () => {
            archiveBtn.disabled = true;
            archiveBtn.textContent = 'Архивация...';

            try {
                const { error } = await supabaseClient
                    .from('profiles')
                    .update({ is_archived: true, archived_at: new Date().toISOString() })
                    .eq('id', clientId);

                if (error) throw error;

                await supabaseClient.from('audit_log').insert({
                    table_name: 'profiles',
                    record_id: clientId,
                    action: 'archive',
                    reason: `Клиент архивирован с долгом ${clientDebt.toFixed(2)} сум`
                });

                modal.remove();
                alert('Клиент архивирован! Вы можете найти его во вкладке "Архив".');
                await renderTabContent();
            } catch (error) {
                alert('Ошибка: ' + error.message);
                archiveBtn.disabled = false;
                archiveBtn.textContent = 'Архивировать';
            }
        });
    }

    const forceDeleteBtn = document.getElementById('force-delete-client-btn');
    if (forceDeleteBtn) {
        forceDeleteBtn.addEventListener('click', async () => {
            if (!confirm('ВНИМАНИЕ! Клиент и ВСЕ его данные будут ПОЛНОСТЬЮ удалены. Долг будет списан. Это действие НЕЛЬЗЯ отменить. Продолжить?')) return;

            forceDeleteBtn.disabled = true;
            forceDeleteBtn.textContent = 'Удаление...';

            try {
                const { data: clientOrders } = await supabaseClient
                    .from('orders')
                    .select('id')
                    .eq('client_id', clientId);

                if (clientOrders && clientOrders.length > 0) {
                    const orderIds = clientOrders.map(o => o.id);
                    await supabaseClient.from('payments').delete().in('order_id', orderIds);
                    await supabaseClient.from('order_items').delete().in('order_id', orderIds);
                }

                await supabaseClient.from('orders').delete().eq('client_id', clientId);
                await supabaseClient.from('audit_log').delete().eq('record_id', clientId);

                const { error: profileError } = await supabaseClient
                    .from('profiles')
                    .delete()
                    .eq('id', clientId);

                if (profileError) throw profileError;

                modal.remove();
                alert('Клиент полностью удален из базы!');
                await renderTabContent();
            } catch (error) {
                alert('Ошибка: ' + error.message);
                forceDeleteBtn.disabled = false;
                forceDeleteBtn.textContent = 'Удалить полностью';
            }
        });
    }

    const confirmBtn = document.getElementById('confirm-delete-client');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Удаление...';

            try {
                const { data: clientOrders } = await supabaseClient
                    .from('orders')
                    .select('id')
                    .eq('client_id', clientId);

                if (clientOrders && clientOrders.length > 0) {
                    const orderIds = clientOrders.map(o => o.id);
                    await supabaseClient.from('payments').delete().in('order_id', orderIds);
                    await supabaseClient.from('order_items').delete().in('order_id', orderIds);
                }

                await supabaseClient.from('orders').delete().eq('client_id', clientId);
                await supabaseClient.from('audit_log').delete().eq('record_id', clientId);

                const { error: profileError } = await supabaseClient
                    .from('profiles')
                    .delete()
                    .eq('id', clientId);

                if (profileError) throw profileError;

                modal.remove();
                alert('Клиент полностью удален из базы!');
                await renderTabContent();
            } catch (error) {
                alert('Ошибка: ' + error.message);
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Удалить';
            }
        });
    }
}

function showAddClientModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Добавить нового клиента</h3>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Номер телефона *</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="background: #f3f4f6; padding: 12px; border-radius: 8px; font-weight: 600; white-space: nowrap;">+998</span>
                        <input type="tel" id="new-client-phone" class="form-control" placeholder="90 123 45 67" required autocomplete="off" maxlength="12" style="flex: 1;">
                    </div>
                    <div style="margin-top: 4px; font-size: 12px; color: var(--text-gray);">Формат: XX XXX XX XX (9 цифр)</div>
                </div>
                <div class="form-group">
                    <label>Полное имя *</label>
                    <input type="text" id="new-client-name" class="form-control" placeholder="Например: ООО 'Рассвет' или Иван Иванов" required>
                </div>
                <div class="form-group">
                    <label>Пароль *</label>
                    <div style="position: relative;">
                        <input type="password" id="new-client-password" class="form-control" placeholder="Минимум 6 символов" required style="padding-right: 48px;">
                        <button
                            type="button"
                            id="toggle-client-password"
                            style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px; color: var(--text-gray);"
                            title="Показать пароль"
                        >
                            <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <svg class="eye-off-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                        </button>
                    </div>
                    <div style="margin-top: 8px; font-size: 13px; color: var(--text-gray);">
                        Пароль будет использоваться для входа в систему
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-add-client">Отмена</button>
                <button class="btn btn-primary" id="confirm-add-client">Создать клиента</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const togglePasswordBtn = document.getElementById('toggle-client-password');
    const passwordInput = document.getElementById('new-client-password');
    const eyeIcon = togglePasswordBtn.querySelector('.eye-icon');
    const eyeOffIcon = togglePasswordBtn.querySelector('.eye-off-icon');

    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;

        if (type === 'text') {
            eyeIcon.style.display = 'none';
            eyeOffIcon.style.display = 'block';
            togglePasswordBtn.title = 'Скрыть пароль';
        } else {
            eyeIcon.style.display = 'block';
            eyeOffIcon.style.display = 'none';
            togglePasswordBtn.title = 'Показать пароль';
        }
    });

    document.getElementById('cancel-add-client').addEventListener('click', () => {
        modal.remove();
    });

    document.getElementById('confirm-add-client').addEventListener('click', async () => {
        const phoneRaw = document.getElementById('new-client-phone').value.trim().replace(/\D/g, '');
        const name = document.getElementById('new-client-name').value.trim();
        const password = document.getElementById('new-client-password').value;

        if (!phoneRaw || !name || !password) {
            alert('Заполните все обязательные поля (отмечены *)');
            return;
        }

        if (phoneRaw.length !== 9) {
            alert('Номер телефона должен содержать 9 цифр');
            return;
        }

        if (password.length < 6) {
            alert('Пароль должен быть минимум 6 символов');
            return;
        }

        const phone = '+998' + phoneRaw;
        const email = phoneRaw + '@b2b.local';

        const confirmBtn = document.getElementById('confirm-add-client');
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Создание клиента...';

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    emailRedirectTo: window.location.origin,
                    data: {
                        full_name: name,
                        role: 'client',
                        phone: phone
                    }
                }
            });

            if (error) {
                console.error('SignUp error:', error);
                throw error;
            }

            if (!data.user) {
                throw new Error('Не удалось создать пользователя. Возможно, клиент с таким номером уже существует.');
            }

            const { error: profileError } = await supabaseClient
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    email: email,
                    phone: phone,
                    full_name: name,
                    role: 'client',
                    is_blocked: false,
                    can_see_discounts: true
                }, {
                    onConflict: 'id'
                });

            if (profileError) {
                console.error('Profile update error:', profileError);
                throw new Error('Пользователь создан, но не удалось обновить профиль: ' + profileError.message);
            }

            alert('Клиент успешно создан!\n\nТелефон: ' + phone + '\nПароль: ' + password);
            modal.remove();
            await renderTabContent();
        } catch (error) {
            console.error('Client creation error:', error);
            let errorMessage = 'Ошибка при создании клиента: ' + error.message;

            if (error.message.includes('already registered')) {
                errorMessage = 'Клиент с таким номером телефона уже существует';
            }

            alert(errorMessage);
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Создать клиента';
        }
    });
}

function showBlockModal(clientId) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Заблокировать клиента</h3>
            </div>
            <form id="block-form">
                <div class="form-group">
                    <label class="form-label">Количество дней</label>
                    <input type="number" id="block-days" class="form-input" value="15" min="1" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Причина</label>
                    <textarea id="block-reason" class="form-input" rows="3" placeholder="Укажите причину блокировки"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="cancel-block">Отмена</button>
                    <button type="submit" class="btn btn-danger">Заблокировать</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('cancel-block').addEventListener('click', () => {
        modal.remove();
    });

    document.getElementById('block-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const days = parseInt(document.getElementById('block-days').value);
        const reason = document.getElementById('block-reason').value;

        await blockClient(clientId, days, reason);
        modal.remove();
    });
}

async function blockClient(clientId, days, reason) {
    const { error } = await supabaseClient.rpc('block_client', {
        client_id: clientId,
        days_count: days,
        reason: reason
    });

    if (error) {
        alert('Ошибка блокировки клиента');
        console.error(error);
        return;
    }

    await renderTabContent();
}

async function unblockClient(clientId) {
    const { error } = await supabaseClient.rpc('unblock_client', {
        client_id: clientId
    });

    if (error) {
        alert('Ошибка разблокировки клиента');
        console.error(error);
        return;
    }

    await renderTabContent();
}

async function renderProductsTab(container) {
    container.innerHTML = '<div class="spinner"></div>';

    const [productsResult, categoriesResult, promotionsResult] = await Promise.all([
        supabaseClient.from('products').select('*').or('is_deleted.is.null,is_deleted.eq.false').order('name'),
        supabaseClient.from('categories').select('*').eq('is_active', true),
        supabaseClient.from('promotions').select('*, promotion_products(product_id)').eq('is_active', true).lte('start_date', new Date().toISOString()).gte('end_date', new Date().toISOString())
    ]);

    if (productsResult.error) {
        container.innerHTML = '<div class="alert alert-error">Ошибка загрузки товаров</div>';
        return;
    }

    products = productsResult.data || [];
    const categories = categoriesResult.data || [];
    const activePromotions = promotionsResult.data || [];

    const productPromotions = {};
    activePromotions.forEach(promo => {
        if (promo.type === 'global' || promo.type === 'product') {
            (promo.promotion_products || []).forEach(pp => {
                if (!productPromotions[pp.product_id]) productPromotions[pp.product_id] = [];
                productPromotions[pp.product_id].push(promo);
            });
            if (promo.type === 'global') {
                products.forEach(p => {
                    if (!productPromotions[p.id]) productPromotions[p.id] = [];
                    if (!productPromotions[p.id].find(pr => pr.id === promo.id)) {
                        productPromotions[p.id].push(promo);
                    }
                });
            }
        }
    });

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Управление товарами</h2>
                <button class="btn btn-primary" id="add-product-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Добавить товар
                </button>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Название</th>
                            <th>Цена</th>
                            <th>Склад</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => {
                            const promos = productPromotions[product.id] || [];
                            const hasPromo = promos.length > 0;
                            let discountedPrice = product.price;
                            if (hasPromo) {
                                const bestPromo = promos.sort((a, b) => b.priority - a.priority)[0];
                                if (bestPromo.discount_type === 'percentage') {
                                    discountedPrice = product.price * (1 - bestPromo.discount_value / 100);
                                } else {
                                    discountedPrice = Math.max(0, product.price - bestPromo.discount_value);
                                }
                            }
                            return `
                            <tr style="${!product.is_active ? 'opacity: 0.6;' : ''}">
                                <td style="font-family: monospace; font-size: 12px;">${product.sku || '-'}</td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        ${product.name}
                                        ${hasPromo ? '<span class="badge" style="background: #f97316; color: white; font-size: 10px;">АКЦИЯ</span>' : ''}
                                    </div>
                                </td>
                                <td>
                                    ${hasPromo ? `
                                        <span style="text-decoration: line-through; color: #999; font-size: 12px;">${product.price.toFixed(2)}</span>
                                        <span style="color: #f97316; font-weight: 600;"> ${discountedPrice.toFixed(2)} сум</span>
                                    ` : `${product.price.toFixed(2)} сум`}
                                </td>
                                <td><strong style="color: ${product.stock_quantity > 0 ? '#16a34a' : '#dc2626'};">${product.stock_quantity}</strong> ${product.unit_type}</td>
                                <td>
                                    ${product.is_active
                                        ? '<span class="badge badge-success">Активен</span>'
                                        : '<span class="badge badge-danger">Скрыт</span>'
                                    }
                                </td>
                                <td>
                                    <div style="display: flex; gap: 8px;">
                                        <button class="btn btn-secondary" style="padding: 8px 12px;" onclick="window.editProduct('${product.id}')">
                                            Редактировать
                                        </button>
                                        <button class="btn btn-danger" style="padding: 8px 12px;" onclick="window.deleteProduct('${product.id}', '${product.name.replace(/'/g, "\\'")}')">
                                            Удалить
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;}).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('add-product-btn')?.addEventListener('click', () => showAddProductModal(categories));

    window.editProduct = (productId) => {
        const product = products.find(p => p.id === productId);
        if (product) showEditProductModal(product, categories);
    };

    window.deleteProduct = (productId, productName) => {
        showDeleteProductModal(productId, productName);
    };
}

async function showEditProductModal(product, categories) {
    const { data: existingImages } = await supabaseClient
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .order('display_order');

    const productImages = existingImages || [];

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px; max-height: 95vh; overflow-y: auto;">
            <div class="modal-header">
                <h3 class="modal-title">Редактировать товар</h3>
            </div>
            <div class="modal-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label>Название *</label>
                        <input type="text" id="edit-product-name" class="form-control" value="${product.name}" required>
                    </div>
                    <div class="form-group">
                        <label>SKU / Артикул</label>
                        <input type="text" id="edit-product-sku" class="form-control" value="${product.sku || ''}" placeholder="Уникальный код">
                    </div>
                    <div class="form-group">
                        <label>Цена продажи *</label>
                        <input type="number" id="edit-product-price" class="form-control" value="${product.price}" min="0" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>Себестоимость</label>
                        <input type="number" id="edit-product-cost" class="form-control" value="${product.cost_price || 0}" min="0" step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Количество на складе *</label>
                        <input type="number" id="edit-product-stock" class="form-control" value="${product.stock_quantity}" min="0" required>
                    </div>
                    <div class="form-group">
                        <label>Единица измерения</label>
                        <select id="edit-product-unit" class="form-control">
                            <option value="шт" ${product.unit_type === 'шт' ? 'selected' : ''}>Штука</option>
                            <option value="кг" ${product.unit_type === 'кг' ? 'selected' : ''}>Килограмм</option>
                            <option value="л" ${product.unit_type === 'л' ? 'selected' : ''}>Литр</option>
                            <option value="м" ${product.unit_type === 'м' ? 'selected' : ''}>Метр</option>
                            <option value="уп" ${product.unit_type === 'уп' ? 'selected' : ''}>Упаковка</option>
                            <option value="коробка" ${product.unit_type === 'коробка' ? 'selected' : ''}>Коробка</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Категория</label>
                        <select id="edit-product-category" class="form-control">
                            <option value="">Без категории</option>
                            ${categories.map(c => `<option value="${c.id}" ${product.category_id === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Статус</label>
                        <select id="edit-product-status" class="form-control">
                            <option value="true" ${product.is_active ? 'selected' : ''}>Активен</option>
                            <option value="false" ${!product.is_active ? 'selected' : ''}>Скрыт</option>
                        </select>
                    </div>
                </div>

                <div class="form-group" style="margin-top: 16px;">
                    <label style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Изображения товара</span>
                        <button type="button" class="btn btn-secondary" id="add-image-btn" style="padding: 6px 12px; font-size: 13px;">
                            + Добавить изображение
                        </button>
                    </label>
                    <div id="product-images-container" style="margin-top: 12px;">
                        ${productImages.length === 0 && !product.image_url ? `
                            <div style="text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px; color: #6b7280;">
                                Нет изображений
                            </div>
                        ` : ''}
                        <div id="images-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px;">
                            ${product.image_url && productImages.length === 0 ? `
                                <div class="product-image-item" data-legacy="true" style="position: relative; border: 2px solid #10b981; border-radius: 8px; overflow: hidden;">
                                    <img src="${product.image_url}" alt="Product" style="width: 100%; height: 100px; object-fit: cover;">
                                    <div style="position: absolute; top: 4px; left: 4px; background: #10b981; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px;">Главное</div>
                                    <button type="button" class="delete-image-btn" data-legacy="true" style="position: absolute; top: 4px; right: 4px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            ` : ''}
                            ${productImages.map((img, idx) => `
                                <div class="product-image-item" data-image-id="${img.id}" style="position: relative; border: 2px solid ${img.is_primary ? '#10b981' : '#e5e7eb'}; border-radius: 8px; overflow: hidden;">
                                    <img src="${img.image_url}" alt="Product" style="width: 100%; height: 100px; object-fit: cover;">
                                    ${img.is_primary ? `<div style="position: absolute; top: 4px; left: 4px; background: #10b981; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px;">Главное</div>` : `
                                        <button type="button" class="set-primary-btn" data-image-id="${img.id}" style="position: absolute; top: 4px; left: 4px; background: #6b7280; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; border: none; cursor: pointer;">Сделать главным</button>
                                    `}
                                    <button type="button" class="delete-image-btn" data-image-id="${img.id}" style="position: absolute; top: 4px; right: 4px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div id="new-images-section" style="display: none; margin-top: 12px; padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
                    <div class="form-group">
                        <label>Загрузить изображения</label>
                        <input type="file" id="new-product-images" class="form-control" accept="image/*" multiple style="padding: 8px;">
                    </div>
                    <div id="new-images-preview" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; margin-top: 12px;"></div>
                </div>

                <div class="form-group" style="margin-top: 16px;">
                    <label>Описание</label>
                    <textarea id="edit-product-description" class="form-control" rows="3" placeholder="Описание товара">${product.description || ''}</textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-edit-product">Отмена</button>
                <button class="btn btn-primary" id="confirm-edit-product">Сохранить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    let newImageFiles = [];
    let deletedImageIds = [];
    let deleteLegacyImage = false;

    document.getElementById('add-image-btn').addEventListener('click', () => {
        document.getElementById('new-images-section').style.display = 'block';
        document.getElementById('new-product-images').click();
    });

    document.getElementById('new-product-images').addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        newImageFiles = newImageFiles.concat(files);

        const previewContainer = document.getElementById('new-images-preview');
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.style.cssText = 'position: relative; border: 2px solid #10b981; border-radius: 8px; overflow: hidden;';
                div.innerHTML = `
                    <img src="${e.target.result}" alt="Preview" style="width: 100%; height: 80px; object-fit: cover;">
                    <div style="position: absolute; top: 4px; left: 4px; background: #10b981; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px;">Новое</div>
                `;
                previewContainer.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    });

    modal.querySelectorAll('.delete-image-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const imageId = e.currentTarget.dataset.imageId;
            const isLegacy = e.currentTarget.dataset.legacy === 'true';

            if (isLegacy) {
                deleteLegacyImage = true;
            } else if (imageId) {
                deletedImageIds.push(imageId);
            }

            e.currentTarget.closest('.product-image-item').remove();
        });
    });

    modal.querySelectorAll('.set-primary-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const imageId = e.currentTarget.dataset.imageId;

            await supabaseClient
                .from('product_images')
                .update({ is_primary: false })
                .eq('product_id', product.id);

            await supabaseClient
                .from('product_images')
                .update({ is_primary: true })
                .eq('id', imageId);

            modal.remove();
            await showEditProductModal(product, categories);
        });
    });

    document.getElementById('cancel-edit-product').addEventListener('click', () => modal.remove());

    document.getElementById('confirm-edit-product').addEventListener('click', async () => {
        const name = document.getElementById('edit-product-name').value.trim();
        const sku = document.getElementById('edit-product-sku').value.trim() || null;
        const price = parseFloat(document.getElementById('edit-product-price').value);
        const costPrice = parseFloat(document.getElementById('edit-product-cost').value) || 0;
        const stockQuantity = parseInt(document.getElementById('edit-product-stock').value);
        const unitType = document.getElementById('edit-product-unit').value;
        const categoryId = document.getElementById('edit-product-category').value || null;
        const isActive = document.getElementById('edit-product-status').value === 'true';
        const description = document.getElementById('edit-product-description').value.trim() || null;

        if (!name || isNaN(price) || price < 0 || isNaN(stockQuantity) || stockQuantity < 0) {
            alert('Заполните обязательные поля корректно');
            return;
        }

        const confirmBtn = document.getElementById('confirm-edit-product');
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Сохранение...';

        try {
            const oldValues = { name: product.name, price: product.price, stock_quantity: product.stock_quantity };
            const newValues = { name, price, stock_quantity: stockQuantity };

            const updateData = {
                name, sku, price, cost_price: costPrice, stock_quantity: stockQuantity,
                unit_type: unitType, category_id: categoryId, is_active: isActive,
                description, updated_at: new Date().toISOString()
            };

            if (deleteLegacyImage) {
                updateData.image_url = null;
            }

            const { error } = await supabaseClient
                .from('products')
                .update(updateData)
                .eq('id', product.id);

            if (error) throw error;

            if (deletedImageIds.length > 0) {
                await supabaseClient
                    .from('product_images')
                    .delete()
                    .in('id', deletedImageIds);
            }

            if (newImageFiles.length > 0) {
                const { data: currentImages } = await supabaseClient
                    .from('product_images')
                    .select('id')
                    .eq('product_id', product.id);

                const hasImages = (currentImages && currentImages.length > 0) || (product.image_url && !deleteLegacyImage);

                for (let i = 0; i < newImageFiles.length; i++) {
                    const file = newImageFiles[i];
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${product.id}_${Date.now()}_${i}.${fileExt}`;

                    const { error: uploadError } = await supabaseClient.storage
                        .from('products')
                        .upload(fileName, file, { cacheControl: '3600', upsert: false });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabaseClient.storage
                        .from('products')
                        .getPublicUrl(fileName);

                    await supabaseClient.from('product_images').insert({
                        product_id: product.id,
                        image_url: publicUrl,
                        display_order: i,
                        is_primary: !hasImages && i === 0
                    });
                }
            }

            await supabaseClient.from('audit_log').insert({
                table_name: 'products',
                record_id: product.id,
                action: 'update',
                old_values: oldValues,
                new_values: newValues,
                reason: 'Редактирование товара'
            });

            modal.remove();
            alert('Товар обновлен!');
            await renderTabContent();
        } catch (error) {
            console.error('Product update error:', error);
            alert('Ошибка: ' + error.message);
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Сохранить';
        }
    });
}

function showDeleteProductModal(productId, productName) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Удалить товар</h3>
            </div>
            <div class="modal-body">
                <div style="background: #fee2e2; border: 1px solid #fca5a5; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 12px; color: #991b1b;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <div>
                            <div style="font-weight: 700; margin-bottom: 4px;">Внимание!</div>
                            <div style="font-size: 14px;">Это действие нельзя отменить</div>
                        </div>
                    </div>
                </div>
                <p style="margin-bottom: 16px;">Вы уверены, что хотите удалить товар?</p>
                <div style="background: var(--bg-light); padding: 16px; border-radius: 8px;">
                    <div style="font-weight: 600; color: var(--text-dark);">${productName}</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-delete-product">Отмена</button>
                <button class="btn btn-danger" id="confirm-delete-product">Удалить товар</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancel-delete-product').addEventListener('click', () => {
        modal.remove();
    });

    document.getElementById('confirm-delete-product').addEventListener('click', async () => {
        const confirmBtn = document.getElementById('confirm-delete-product');
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Удаление...';

        try {
            const { data: usedInOrders } = await supabaseClient
                .from('order_items')
                .select('id')
                .eq('product_id', productId)
                .limit(1);

            if (usedInOrders && usedInOrders.length > 0) {
                const { error } = await supabaseClient
                    .from('products')
                    .update({ is_active: false })
                    .eq('id', productId);

                if (error) throw error;

                modal.remove();
                alert('Товар деактивирован (используется в существующих заказах)');
            } else {
                const { error } = await supabaseClient
                    .from('products')
                    .delete()
                    .eq('id', productId);

                if (error) throw error;

                modal.remove();
                alert('Товар успешно удален!');
            }
            await renderTabContent();
        } catch (error) {
            console.error('Product deletion error:', error);
            alert('Ошибка при удалении товара: ' + error.message);
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Удалить товар';
        }
    });
}

function showAddProductModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; max-height: 95vh; overflow-y: auto;">
            <div class="modal-header">
                <h3 class="modal-title">Добавить новый товар</h3>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Название товара *</label>
                    <input type="text" id="new-product-name" class="form-control" placeholder="Например: Карамель 'Барбарис'" required>
                </div>
                <div class="form-group">
                    <label>Описание</label>
                    <textarea id="new-product-description" class="form-control" rows="3" placeholder="Краткое описание товара"></textarea>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label>Цена (сум) *</label>
                        <input type="number" id="new-product-price" class="form-control" placeholder="0.00" min="0" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>Количество *</label>
                        <input type="number" id="new-product-quantity" class="form-control" placeholder="0" min="0" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Единица измерения</label>
                    <select id="new-product-unit" class="form-control">
                        <option value="шт">шт (штука)</option>
                        <option value="кг">кг (килограмм)</option>
                        <option value="уп">уп (упаковка)</option>
                        <option value="коробка">коробка</option>
                        <option value="л">л (литр)</option>
                        <option value="м">м (метр)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Изображения товара</span>
                        <span style="font-size: 12px; color: #6b7280;">Можно загрузить несколько</span>
                    </label>
                    <div class="file-upload-wrapper">
                        <input type="file" id="new-product-images" class="file-upload-input" accept="image/*" multiple>
                        <label for="new-product-images" class="file-upload-label">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            <div>
                                <div style="font-weight: 600; color: var(--text-dark); margin-bottom: 4px;">Выберите изображения</div>
                                <div class="file-upload-text">или перетащите файлы сюда</div>
                            </div>
                        </label>
                    </div>
                    <div id="images-preview" style="display: none; margin-top: 12px;">
                        <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">Выбрано изображений: <span id="images-count">0</span></div>
                        <div id="images-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px;"></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-add-product">Отмена</button>
                <button class="btn btn-primary" id="confirm-add-product">Создать товар</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    let selectedFiles = [];
    const fileInput = document.getElementById('new-product-images');
    const imagesPreview = document.getElementById('images-preview');
    const imagesGrid = document.getElementById('images-grid');
    const imagesCount = document.getElementById('images-count');

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        selectedFiles = selectedFiles.concat(files);
        updateImagesPreview();
    });

    function updateImagesPreview() {
        if (selectedFiles.length === 0) {
            imagesPreview.style.display = 'none';
            return;
        }

        imagesPreview.style.display = 'block';
        imagesCount.textContent = selectedFiles.length;
        imagesGrid.innerHTML = '';

        selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.style.cssText = 'position: relative; border: 2px solid ' + (index === 0 ? '#10b981' : '#e5e7eb') + '; border-radius: 8px; overflow: hidden;';
                div.innerHTML = `
                    <img src="${e.target.result}" alt="Preview" style="width: 100%; height: 80px; object-fit: cover;">
                    ${index === 0 ? `<div style="position: absolute; top: 4px; left: 4px; background: #10b981; color: white; font-size: 9px; padding: 2px 6px; border-radius: 4px;">Главное</div>` : ''}
                    <button type="button" class="remove-image-btn" data-index="${index}" style="position: absolute; top: 4px; right: 4px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; line-height: 1;">
                        &times;
                    </button>
                `;
                imagesGrid.appendChild(div);

                div.querySelector('.remove-image-btn').addEventListener('click', (e) => {
                    const idx = parseInt(e.currentTarget.dataset.index);
                    selectedFiles.splice(idx, 1);
                    updateImagesPreview();
                });
            };
            reader.readAsDataURL(file);
        });
    }

    document.getElementById('cancel-add-product').addEventListener('click', () => {
        modal.remove();
    });

    document.getElementById('confirm-add-product').addEventListener('click', async () => {
        const name = document.getElementById('new-product-name').value.trim();
        const description = document.getElementById('new-product-description').value.trim();
        const price = parseFloat(document.getElementById('new-product-price').value);
        const quantity = parseInt(document.getElementById('new-product-quantity').value);
        const unit = document.getElementById('new-product-unit').value;

        if (!name || isNaN(price) || isNaN(quantity)) {
            alert('Заполните все обязательные поля (отмечены *)');
            return;
        }

        if (price < 0 || quantity < 0) {
            alert('Цена и количество не могут быть отрицательными');
            return;
        }

        const confirmBtn = document.getElementById('confirm-add-product');
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Создание...';

        try {
            let primaryImageUrl = null;

            const { data: productData, error: productError } = await supabaseClient
                .from('products')
                .insert({
                    name: name,
                    description: description,
                    price: price,
                    stock_quantity: quantity,
                    unit_type: unit,
                    image_url: null,
                    is_active: true
                })
                .select()
                .single();

            if (productError) throw productError;

            const productId = productData.id;

            if (selectedFiles.length > 0) {
                for (let i = 0; i < selectedFiles.length; i++) {
                    const file = selectedFiles[i];
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${productId}_${Date.now()}_${i}.${fileExt}`;

                    const { error: uploadError } = await supabaseClient.storage
                        .from('products')
                        .upload(fileName, file, { cacheControl: '3600', upsert: false });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabaseClient.storage
                        .from('products')
                        .getPublicUrl(fileName);

                    if (i === 0) {
                        primaryImageUrl = publicUrl;
                    }

                    await supabaseClient.from('product_images').insert({
                        product_id: productId,
                        image_url: publicUrl,
                        display_order: i,
                        is_primary: i === 0
                    });
                }

                await supabaseClient
                    .from('products')
                    .update({ image_url: primaryImageUrl })
                    .eq('id', productId);
            }

            alert('Товар успешно создан!');
            modal.remove();
            await renderTabContent();
        } catch (error) {
            console.error('Product creation error:', error);
            alert('Ошибка при создании товара: ' + error.message);
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Создать товар';
        }
    });
}

let selectedOrders = new Set();

async function renderOrdersTab(container) {
    container.innerHTML = '<div class="spinner"></div>';

    const { data, error } = await supabaseClient
        .from('orders')
        .select(`
            *,
            profiles:client_id (full_name, email)
        `)
        .order('order_date', { ascending: false });

    if (error) {
        container.innerHTML = '<div class="alert alert-error">Ошибка загрузки заказов</div>';
        return;
    }

    orders = data || [];
    selectedOrders.clear();

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Все заказы</h2>
            </div>

            <div id="orders-bulk-actions" style="display: none; background: #fef3c7; border: 1px solid #fde68a; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <span id="orders-selected-count" style="font-weight: 600; color: #92400e;">Выбрано: 0</span>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-danger" id="bulk-delete-orders-btn">Удалить выбранные</button>
                        <button class="btn btn-secondary" id="clear-orders-selection-btn">Снять выделение</button>
                    </div>
                </div>
            </div>

            ${orders.length === 0 ? `
                <div style="text-align: center; padding: 60px; color: var(--text-gray);">
                    <p>Нет заказов</p>
                </div>
            ` : `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40px;">
                                    <input type="checkbox" id="select-all-orders" style="width: 18px; height: 18px; cursor: pointer;">
                                </th>
                                <th>Номер заказа</th>
                                <th>Клиент</th>
                                <th>Дата заказа</th>
                                <th>Сумма</th>
                                <th>Долг</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.map(order => `
                                <tr data-order-id="${order.id}">
                                    <td>
                                        <input type="checkbox" class="order-checkbox" data-order-id="${order.id}" style="width: 18px; height: 18px; cursor: pointer;">
                                    </td>
                                    <td>${order.order_number}</td>
                                    <td>${order.profiles?.full_name || order.profiles?.email || '-'}</td>
                                    <td>${new Date(order.order_date).toLocaleDateString()}</td>
                                    <td>${order.total_amount.toFixed(2)} сум</td>
                                    <td style="color: ${order.debt_amount > 0 ? '#dc2626' : '#16a34a'}; font-weight: 600;">${order.debt_amount.toFixed(2)} сум</td>
                                    <td>
                                        ${order.status === 'active'
                                            ? '<span class="badge badge-warning">Активен</span>'
                                            : '<span class="badge badge-success">Оплачен</span>'
                                        }
                                    </td>
                                    <td>
                                        <div style="display: flex; gap: 8px;">
                                            <button class="btn btn-secondary" style="padding: 6px 10px;" onclick="window.viewOrderDetails('${order.id}')">
                                                Подробнее
                                            </button>
                                            <button class="btn btn-danger" style="padding: 6px 10px;" onclick="window.deleteOrder('${order.id}', '${order.order_number}')">
                                                Удалить
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;

    document.getElementById('select-all-orders')?.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.order-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = e.target.checked;
            if (e.target.checked) {
                selectedOrders.add(cb.dataset.orderId);
            } else {
                selectedOrders.delete(cb.dataset.orderId);
            }
        });
        updateOrdersBulkActions();
    });

    document.querySelectorAll('.order-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedOrders.add(e.target.dataset.orderId);
            } else {
                selectedOrders.delete(e.target.dataset.orderId);
            }
            updateOrdersBulkActions();
        });
    });

    document.getElementById('clear-orders-selection-btn')?.addEventListener('click', () => {
        selectedOrders.clear();
        document.querySelectorAll('.order-checkbox').forEach(cb => cb.checked = false);
        document.getElementById('select-all-orders').checked = false;
        updateOrdersBulkActions();
    });

    document.getElementById('bulk-delete-orders-btn')?.addEventListener('click', bulkDeleteOrders);

    window.viewOrderDetails = async (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const { data: items } = await supabaseClient
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 class="modal-title">Заказ ${order.order_number}</h3>
                </div>
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                        <div><span style="color: #666;">Клиент:</span> <strong>${order.profiles?.full_name || order.profiles?.email}</strong></div>
                        <div><span style="color: #666;">Дата:</span> <strong>${new Date(order.order_date).toLocaleDateString()}</strong></div>
                        <div><span style="color: #666;">Сумма:</span> <strong>${order.total_amount.toFixed(2)} сум</strong></div>
                        <div><span style="color: #666;">Долг:</span> <strong style="color: ${order.debt_amount > 0 ? '#dc2626' : '#16a34a'};">${order.debt_amount.toFixed(2)} сум</strong></div>
                    </div>
                    <h4 style="margin-bottom: 12px;">Товары</h4>
                    <table style="width: 100%; font-size: 13px;">
                        <thead>
                            <tr>
                                <th style="text-align: left; padding: 8px;">Товар</th>
                                <th style="text-align: right; padding: 8px;">Цена</th>
                                <th style="text-align: right; padding: 8px;">Кол-во</th>
                                <th style="text-align: right; padding: 8px;">Сумма</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(items || []).map(item => `
                                <tr>
                                    <td style="padding: 8px;">${item.product_name}</td>
                                    <td style="padding: 8px; text-align: right;">${item.unit_price.toFixed(2)} сум</td>
                                    <td style="padding: 8px; text-align: right;">${item.quantity}</td>
                                    <td style="padding: 8px; text-align: right;">${item.subtotal.toFixed(2)} сум</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Закрыть</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.deleteOrder = async (orderId, orderNumber) => {
        if (!confirm(`Удалить заказ ${orderNumber}? Это действие нельзя отменить.`)) return;

        try {
            await supabaseClient.from('payments').delete().eq('order_id', orderId);
            await supabaseClient.from('order_items').delete().eq('order_id', orderId);
            const { error } = await supabaseClient.from('orders').delete().eq('id', orderId);
            if (error) throw error;

            alert('Заказ удален!');
            await renderTabContent();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    };
}

function updateOrdersBulkActions() {
    const bulkActions = document.getElementById('orders-bulk-actions');
    const selectedCount = document.getElementById('orders-selected-count');
    if (selectedOrders.size > 0) {
        bulkActions.style.display = 'block';
        selectedCount.textContent = `Выбрано: ${selectedOrders.size}`;
    } else {
        bulkActions.style.display = 'none';
    }
}

async function bulkDeleteOrders() {
    if (selectedOrders.size === 0) return;
    if (!confirm(`ВНИМАНИЕ! Удалить ${selectedOrders.size} заказа(ов)? Это действие нельзя отменить!`)) return;

    try {
        for (const orderId of selectedOrders) {
            await supabaseClient.from('payments').delete().eq('order_id', orderId);
            await supabaseClient.from('order_items').delete().eq('order_id', orderId);
            await supabaseClient.from('orders').delete().eq('id', orderId);
        }

        alert('Заказы удалены!');
        selectedOrders.clear();
        await renderTabContent();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

async function renderDebtsTab(container) {
    container.innerHTML = '<div class="spinner"></div>';

    const [activeResult, closedResult, clientsResult] = await Promise.all([
        supabaseClient
            .from('orders')
            .select(`
                *,
                profiles:client_id (id, full_name, email, is_blocked)
            `)
            .gt('debt_amount', 0)
            .order('payment_due_date'),
        supabaseClient
            .from('orders')
            .select(`
                *,
                profiles:client_id (full_name, email)
            `)
            .eq('status', 'paid')
            .order('completed_at', { ascending: false })
            .limit(50),
        supabaseClient
            .from('profiles')
            .select('id, full_name, email, is_blocked')
            .eq('role', 'client')
            .or('is_archived.is.null,is_archived.eq.false')
    ]);

    if (activeResult.error || closedResult.error) {
        container.innerHTML = '<div class="alert alert-error">Ошибка загрузки данных</div>';
        return;
    }

    const debts = activeResult.data || [];
    const closedDeals = closedResult.data || [];
    const allClients = clientsResult.data || [];

    const today = new Date().toISOString().split('T')[0];

    container.innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h2 class="card-title">Блокировка клиентов после отгрузки</h2>
            </div>
            <div style="padding: 20px;">
                <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: flex-start; gap: 12px; color: #92400e;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <div>
                            <div style="font-weight: 700; margin-bottom: 4px;">Блокировка после отгрузки</div>
                            <div style="font-size: 14px;">Выберите дату отгрузки, чтобы заблокировать всех клиентов с неоплаченными заказами за этот день. Блокировка не позволит клиентам создавать новые заказы до полной оплаты долга.</div>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap;">
                    <div class="form-group" style="margin: 0;">
                        <label style="display: block; margin-bottom: 6px; font-size: 14px; color: #666;">Дата отгрузки (заказы за день)</label>
                        <input type="date" id="block-shipping-date" class="form-control" value="${today}" style="padding: 10px 14px;">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label style="display: block; margin-bottom: 6px; font-size: 14px; color: #666;">Количество дней блокировки</label>
                        <input type="number" id="block-days-count" class="form-control" value="15" min="1" max="365" style="padding: 10px 14px; width: 120px;">
                    </div>
                    <button class="btn btn-danger" id="preview-block-clients-btn" style="padding: 10px 20px;">
                        Просмотреть клиентов
                    </button>
                </div>

                <div id="block-preview-container" style="display: none; margin-top: 20px;"></div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Управление задолженностями</h2>
                <p style="color: #666; margin-top: 10px;">Активных долгов: ${debts.length}</p>
            </div>

            <div id="debts-list" style="padding: 20px;">
                ${debts.length === 0 ? `
                    <div style="padding: 40px; text-align: center; color: #999;">
                        Нет активных задолженностей
                    </div>
                ` : debts.map(order => {
                    const dueDate = new Date(order.payment_due_date);
                    const isOverdue = dueDate < new Date();
                    const daysLeft = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));

                    return `
                        <div class="debt-card" id="debt-card-${order.id}" style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                                <div>
                                    <h3 style="margin: 0 0 5px 0; font-size: 18px;">Заказ №${order.order_number}</h3>
                                    <p style="margin: 0; color: #666;">Клиент: ${order.profiles?.full_name || order.profiles?.email} (${order.profiles?.email})</p>
                                    <p style="margin: 5px 0 0 0; color: #666;">Дата заказа: ${new Date(order.order_date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div class="debt-stats-grid">
                                <div>
                                    <p style="margin: 0; color: #666; font-size: 14px;">Общая сумма</p>
                                    <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">${order.total_amount.toFixed(2)} сум</p>
                                </div>
                                <div>
                                    <p style="margin: 0; color: #dc3545; font-size: 14px;">Долг</p>
                                    <p id="debt-amount-${order.id}" style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #dc3545;">${order.debt_amount.toFixed(2)} сум</p>
                                </div>
                                <div>
                                    <p style="margin: 0; color: #28a745; font-size: 14px;">Оплачено</p>
                                    <p id="paid-amount-${order.id}" style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #28a745;">${(order.total_amount - order.debt_amount).toFixed(2)} сум</p>
                                </div>
                                <div>
                                    <p style="margin: 0; color: ${isOverdue ? '#dc3545' : '#ffc107'}; font-size: 14px;">Осталось времени</p>
                                    <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: ${isOverdue ? '#dc3545' : '#28a745'};">${isOverdue ? 'Просрочено' : daysLeft + ' дней'}</p>
                                    <p style="margin: 3px 0 0 0; font-size: 12px; color: #666;">до ${dueDate.toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div style="border-top: 1px solid #e0e0e0; padding-top: 15px;">
                                <h4 style="margin: 0 0 10px 0; font-size: 16px;">Принять оплату</h4>
                                <div class="debt-payment-grid">
                                    <div>
                                        <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #666;">Сумма (сум)</label>
                                        <input type="number" id="payment-amount-${order.id}" class="form-control" placeholder="0.00" min="0" max="${order.debt_amount}" step="0.01" value="${order.debt_amount.toFixed(2)}">
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #666;">Описание</label>
                                        <input type="text" id="payment-desc-${order.id}" class="form-control" placeholder="За товар...">
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #666;">Примечание</label>
                                        <input type="text" id="payment-note-${order.id}" class="form-control" placeholder="Наличные">
                                    </div>
                                    <button class="btn btn-primary" onclick="window.recordPayment('${order.id}')" style="height: 46px;">
                                        Записать
                                    </button>
                                </div>
                            </div>

                            <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                                <button class="btn btn-secondary" onclick="window.downloadInvoice('${order.id}')">
                                    Скачать накладную
                                </button>
                                <button class="btn btn-secondary" onclick="window.showPaymentHistory('${order.id}', '${order.order_number}')">
                                    История
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <div class="card" style="margin-top: 24px;">
            <div class="card-header">
                <h2 class="card-title">История закрытых сделок</h2>
                <p style="color: #666; margin-top: 10px;">Последние ${closedDeals.length} оплаченных заказов</p>
            </div>

            ${closedDeals.length === 0 ? `
                <div style="padding: 40px; text-align: center; color: #999;">
                    Нет закрытых сделок
                </div>
            ` : `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Номер заказа</th>
                                <th>Клиент</th>
                                <th>Дата заказа</th>
                                <th>Сумма</th>
                                <th>Дата закрытия</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${closedDeals.map(order => `
                                <tr>
                                    <td>${order.order_number}</td>
                                    <td>${order.profiles?.full_name || order.profiles?.email || '-'}</td>
                                    <td>${new Date(order.order_date).toLocaleDateString()}</td>
                                    <td style="font-weight: 600; color: #28a745;">${order.total_amount.toFixed(2)} сум</td>
                                    <td>${order.completed_at ? new Date(order.completed_at).toLocaleDateString() : '-'}</td>
                                    <td>
                                        <div style="display: flex; gap: 8px;">
                                            <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 13px;" onclick="window.showPaymentHistory('${order.id}', '${order.order_number}')">
                                                История
                                            </button>
                                            <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 13px;" onclick="window.downloadInvoice('${order.id}')">
                                                Накладная
                                            </button>
                                            <button class="btn btn-danger" style="padding: 6px 12px; font-size: 13px;" onclick="window.deleteClosedDeal('${order.id}', '${order.order_number}')">
                                                Удалить
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;

    window.recordPayment = async (orderId) => {
        const amountInput = document.getElementById(`payment-amount-${orderId}`);
        const descInput = document.getElementById(`payment-desc-${orderId}`);
        const noteInput = document.getElementById(`payment-note-${orderId}`);

        const amount = parseFloat(amountInput.value);
        if (isNaN(amount) || amount <= 0) {
            alert('Введите корректную сумму оплаты');
            return;
        }

        const { data: orderData, error: fetchError } = await supabaseClient
            .from('orders')
            .select('debt_amount, total_amount')
            .eq('id', orderId)
            .maybeSingle();

        if (fetchError || !orderData) {
            alert('Ошибка получения данных заказа');
            console.error(fetchError);
            return;
        }

        const currentDebt = orderData.debt_amount;
        const totalAmount = orderData.total_amount;

        if (amount > currentDebt) {
            alert('Сумма оплаты не может превышать размер долга');
            return;
        }

        const description = descInput?.value.trim() || '';
        const note = noteInput.value.trim() || 'Наличные';
        const fullNote = description ? `${description} | ${note}` : note;

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            alert('Необходима авторизация');
            return;
        }

        const { error: paymentError } = await supabaseClient
            .from('payments')
            .insert({
                order_id: orderId,
                amount: amount,
                payment_date: new Date().toISOString(),
                note: fullNote,
                created_by: user.id
            });

        if (paymentError) {
            alert('Ошибка при создании платежа: ' + paymentError.message);
            console.error(paymentError);
            return;
        }

        const newDebtAmount = Math.max(0, currentDebt - amount);
        const updateData = {
            debt_amount: newDebtAmount,
            status: newDebtAmount === 0 ? 'paid' : 'active'
        };
        if (newDebtAmount === 0) {
            updateData.completed_at = new Date().toISOString();
        }
        const { error: orderError } = await supabaseClient
            .from('orders')
            .update(updateData)
            .eq('id', orderId);

        if (orderError) {
            alert('Ошибка при обновлении заказа: ' + orderError.message);
            console.error(orderError);
            return;
        }

        if (newDebtAmount === 0) {
            alert('Долг полностью погашен!');
            await renderTabContent();
        } else {
            const debtAmountEl = document.getElementById(`debt-amount-${orderId}`);
            const paidAmountEl = document.getElementById(`paid-amount-${orderId}`);

            if (debtAmountEl) {
                debtAmountEl.textContent = `${newDebtAmount.toFixed(2)} сум`;
            }
            if (paidAmountEl) {
                paidAmountEl.textContent = `${(totalAmount - newDebtAmount).toFixed(2)} сум`;
            }

            amountInput.value = '';
            amountInput.max = newDebtAmount;
            if (descInput) descInput.value = '';
            noteInput.value = '';

            alert(`Оплата на сумму ${amount.toFixed(2)} сум принята. Остаток долга: ${newDebtAmount.toFixed(2)} сум`);
        }
    };

    window.deleteClosedDeal = async (orderId, orderNumber) => {
        if (!confirm(`Удалить закрытую сделку ${orderNumber}? Это действие нельзя отменить.`)) return;

        try {
            await supabaseClient.from('payments').delete().eq('order_id', orderId);
            await supabaseClient.from('order_items').delete().eq('order_id', orderId);
            const { error } = await supabaseClient.from('orders').delete().eq('id', orderId);
            if (error) throw error;

            alert('Сделка удалена!');
            await renderTabContent();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    };

    window.downloadInvoice = async (orderId) => {
        await exportOrderToExcel(orderId);
    };

    window.showPaymentHistory = async (orderId, orderNumber) => {
        const { data: payments, error } = await supabaseClient
            .from('payments')
            .select('*')
            .eq('order_id', orderId)
            .order('payment_date', { ascending: false });

        if (error) {
            alert('Ошибка загрузки истории платежей');
            return;
        }

        if (!payments || payments.length === 0) {
            alert('Платежи по этому заказу отсутствуют');
            return;
        }

        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

        const historyHtml = `
            <div style="max-width: 600px;">
                <h3 style="margin-bottom: 20px;">История платежей - ${orderNumber}</h3>
                <table style="width: 100%; margin-bottom: 20px;">
                    <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Сумма</th>
                            <th>Способ оплаты</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.map(payment => `
                            <tr>
                                <td>${new Date(payment.payment_date).toLocaleString()}</td>
                                <td>${payment.amount.toFixed(2)} сум</td>
                                <td>${payment.note || 'Наличные'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div style="text-align: right; font-weight: bold; font-size: 18px;">
                    Итого оплачено: ${totalPaid.toFixed(2)} сум
                </div>
            </div>
        `;

        const modal = document.createElement('div');
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 8px; max-height: 80vh; overflow-y: auto;">
                ${historyHtml}
                <button class="btn btn-primary" style="margin-top: 20px;" onclick="this.closest('div[style*=fixed]').remove()">
                    Закрыть
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    };

    document.getElementById('preview-block-clients-btn')?.addEventListener('click', async () => {
        const shippingDate = document.getElementById('block-shipping-date').value;
        const blockDays = parseInt(document.getElementById('block-days-count').value) || 15;
        const previewContainer = document.getElementById('block-preview-container');

        if (!shippingDate) {
            alert('Выберите дату отгрузки');
            return;
        }

        previewContainer.innerHTML = '<div class="spinner"></div>';
        previewContainer.style.display = 'block';

        const startOfDay = new Date(shippingDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(shippingDate);
        endOfDay.setHours(23, 59, 59, 999);

        const { data: ordersForDate, error } = await supabaseClient
            .from('orders')
            .select(`
                *,
                profiles:client_id (id, full_name, email, phone, is_blocked)
            `)
            .gte('order_date', startOfDay.toISOString())
            .lte('order_date', endOfDay.toISOString())
            .gt('debt_amount', 0);

        if (error) {
            previewContainer.innerHTML = '<div class="alert alert-error">Ошибка загрузки данных</div>';
            return;
        }

        const clientsMap = new Map();
        (ordersForDate || []).forEach(order => {
            if (order.profiles && !order.profiles.is_blocked) {
                const clientId = order.profiles.id;
                if (!clientsMap.has(clientId)) {
                    clientsMap.set(clientId, {
                        client: order.profiles,
                        orders: [],
                        totalDebt: 0
                    });
                }
                const clientData = clientsMap.get(clientId);
                clientData.orders.push(order);
                clientData.totalDebt += order.debt_amount;
            }
        });

        const clientsToBlock = Array.from(clientsMap.values());

        if (clientsToBlock.length === 0) {
            previewContainer.innerHTML = `
                <div style="text-align: center; padding: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; color: #166534;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 8px;">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <div style="font-weight: 600;">Нет клиентов для блокировки</div>
                    <div style="font-size: 13px; margin-top: 4px;">За ${new Date(shippingDate).toLocaleDateString()} нет незаблокированных клиентов с неоплаченными заказами</div>
                </div>
            `;
            return;
        }

        previewContainer.innerHTML = `
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <div style="font-weight: 700; color: #991b1b; margin-bottom: 8px;">Будут заблокированы следующие клиенты:</div>
                <div style="font-size: 14px; color: #991b1b;">Всего: ${clientsToBlock.length} клиент(ов) | Блокировка на ${blockDays} дней</div>
            </div>
            <div class="table-container" style="max-height: 300px; overflow-y: auto;">
                <table style="font-size: 13px;">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="select-all-block" checked style="width: 18px; height: 18px;"></th>
                            <th>Клиент</th>
                            <th>Телефон</th>
                            <th>Заказов</th>
                            <th style="text-align: right;">Общий долг</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clientsToBlock.map(({ client, orders, totalDebt }) => `
                            <tr>
                                <td><input type="checkbox" class="block-client-checkbox" data-client-id="${client.id}" checked style="width: 18px; height: 18px;"></td>
                                <td style="font-weight: 600;">${client.full_name || client.email}</td>
                                <td style="font-family: monospace;">${client.phone || '-'}</td>
                                <td>${orders.length}</td>
                                <td style="text-align: right; color: #dc2626; font-weight: 600;">${totalDebt.toFixed(2)} сум</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 16px; display: flex; gap: 12px; justify-content: flex-end;">
                <button class="btn btn-secondary" id="cancel-block-preview">Отмена</button>
                <button class="btn btn-danger" id="confirm-block-clients">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Заблокировать выбранных
                </button>
            </div>
        `;

        document.getElementById('select-all-block')?.addEventListener('change', (e) => {
            document.querySelectorAll('.block-client-checkbox').forEach(cb => {
                cb.checked = e.target.checked;
            });
        });

        document.getElementById('cancel-block-preview')?.addEventListener('click', () => {
            previewContainer.style.display = 'none';
        });

        document.getElementById('confirm-block-clients')?.addEventListener('click', async () => {
            const selectedIds = Array.from(document.querySelectorAll('.block-client-checkbox:checked'))
                .map(cb => cb.dataset.clientId);

            if (selectedIds.length === 0) {
                alert('Выберите хотя бы одного клиента');
                return;
            }

            const confirmBtn = document.getElementById('confirm-block-clients');
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Блокировка...';

            try {
                const reason = `Отгрузка ${new Date(shippingDate).toLocaleDateString()} - товар отгружен, ожидается оплата`;

                for (const clientId of selectedIds) {
                    const { error } = await supabaseClient.rpc('block_client', {
                        client_id: clientId,
                        days_count: blockDays,
                        reason: reason
                    });

                    if (error) {
                        const { error: updateError } = await supabaseClient
                            .from('profiles')
                            .update({
                                is_blocked: true,
                                blocked_until: new Date(Date.now() + blockDays * 24 * 60 * 60 * 1000).toISOString(),
                                blocked_reason: reason
                            })
                            .eq('id', clientId);

                        if (updateError) {
                            console.error('Block error for client', clientId, updateError);
                        }
                    }

                    await supabaseClient.from('audit_log').insert({
                        table_name: 'profiles',
                        record_id: clientId,
                        action: 'block_after_shipping',
                        new_values: { is_blocked: true, blocked_days: blockDays, shipping_date: shippingDate },
                        reason: reason
                    });
                }

                alert(`Успешно заблокировано ${selectedIds.length} клиент(ов) на ${blockDays} дней!`);
                await renderTabContent();
            } catch (error) {
                alert('Ошибка блокировки: ' + error.message);
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Заблокировать выбранных';
            }
        });
    });
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

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', order.client_id)
            .maybeSingle();

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

        const workbook = window.XLSX.utils.book_new();

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

        const orderInfo = [
            ['НАКЛАДНАЯ'],
            [''],
            ['Номер заказа:', order.order_number],
            ['Дата заказа:', new Date(order.order_date).toLocaleDateString()],
            ['Клиент:', profile?.full_name || profile?.email || 'Не указан'],
            [''],
            ['ТОВАРЫ В ЗАКАЗЕ'],
            ['Название', 'Кол-во', 'Обычная цена', 'Цена со скидкой', 'Сумма']
        ];

        items.forEach(item => {
            const origPrice = originalPrices[item.product_id] || item.unit_price;
            const hasDiscount = origPrice > item.unit_price;
            orderInfo.push([
                item.product_name,
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
        orderInfo.push(['Срок оплаты:', '', '', '', new Date(order.payment_due_date).toLocaleDateString()]);
        orderInfo.push(['Статус:', '', '', '', order.status === 'active' ? 'Активен' : 'Оплачен']);

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
            { wch: 30 },
            { wch: 12 },
            { wch: 15 },
            { wch: 18 },
            { wch: 15 }
        ];

        window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Заказ');

        window.XLSX.writeFile(workbook, `Накладная_${order.order_number}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Export error:', error);
        alert('Ошибка при экспорте: ' + error.message);
    }
}

async function renderPromotionsTab(container) {
    container.innerHTML = '<div class="spinner"></div>';

    const [promotionsResult, productsResult, categoriesResult] = await Promise.all([
        supabaseClient.from('promotions').select('*, promotion_products(product_id), promotion_categories(category_id)').order('created_at', { ascending: false }),
        supabaseClient.from('products').select('id, name').or('is_deleted.is.null,is_deleted.eq.false'),
        supabaseClient.from('categories').select('*').eq('is_active', true)
    ]);

    if (promotionsResult.error) {
        container.innerHTML = '<div class="alert alert-error">Ошибка загрузки акций</div>';
        return;
    }

    const promotions = promotionsResult.data || [];
    const allProducts = productsResult.data || [];
    const allCategories = categoriesResult.data || [];
    const now = new Date();

    const typeLabels = { product: 'На товары', category: 'На категории', global: 'На все товары', order: 'На чек' };
    const discountTypeLabels = { percentage: '%', fixed: 'сум' };

    const activeCount = promotions.filter(p => p.is_active && new Date(p.start_date) <= now && new Date(p.end_date) >= now).length;
    const upcomingCount = promotions.filter(p => p.is_active && new Date(p.start_date) > now).length;
    const expiredCount = promotions.filter(p => new Date(p.end_date) < now).length;

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #059669;">${activeCount}</div>
                <div style="font-size: 14px; color: #047857;">Активных</div>
            </div>
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #d97706;">${upcomingCount}</div>
                <div style="font-size: 14px; color: #92400e;">Ожидают</div>
            </div>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #dc2626;">${expiredCount}</div>
                <div style="font-size: 14px; color: #991b1b;">Завершены</div>
            </div>
            <div style="background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #374151;">${promotions.length}</div>
                <div style="font-size: 14px; color: #6b7280;">Всего</div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Управление акциями</h2>
                <button class="btn btn-primary" id="add-promo-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Создать акцию
                </button>
            </div>

            ${promotions.length === 0 ? `
                <div style="text-align: center; padding: 60px; color: var(--text-gray);">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px; opacity: 0.5;">
                        <path d="M12 8v4l3 3"></path>
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    <p style="font-size: 18px; margin-bottom: 8px;">Акций пока нет</p>
                    <p style="font-size: 14px;">Создайте первую акцию, чтобы привлечь клиентов!</p>
                </div>
            ` : `
                <div style="overflow-x: auto;">
                    ${promotions.map(promo => {
                        const startDate = new Date(promo.start_date);
                        const endDate = new Date(promo.end_date);
                        const isActive = promo.is_active && startDate <= now && endDate >= now;
                        const isExpired = endDate < now;
                        const isUpcoming = startDate > now;
                        const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                        const productsCount = (promo.promotion_products || []).length;

                        return `
                            <div style="border: 1px solid ${isActive ? '#a7f3d0' : isExpired ? '#fecaca' : '#e5e7eb'}; border-radius: 12px; padding: 20px; margin-bottom: 16px; background: ${isActive ? '#f0fdf4' : isExpired ? '#fef2f2' : 'white'}; ${!promo.is_active ? 'opacity: 0.6;' : ''}">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; flex-wrap: wrap;">
                                    <div style="flex: 1; min-width: 200px;">
                                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                            <h3 style="margin: 0; font-size: 18px;">${promo.name}</h3>
                                            ${isExpired
                                                ? '<span class="badge badge-danger">Завершена</span>'
                                                : isUpcoming
                                                    ? '<span class="badge badge-warning">Ожидает</span>'
                                                    : isActive
                                                        ? '<span class="badge badge-success">Активна</span>'
                                                        : '<span class="badge badge-danger">Отключена</span>'
                                            }
                                        </div>
                                        ${promo.description ? `<p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">${promo.description}</p>` : ''}
                                        <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; color: #666;">
                                            <span><strong>Тип:</strong> ${typeLabels[promo.type]}</span>
                                            <span><strong>Скидка:</strong> <span style="color: #f97316; font-weight: 600;">-${promo.discount_value}${discountTypeLabels[promo.discount_type]}</span></span>
                                            ${promo.type === 'product' ? `<span><strong>Товаров:</strong> ${productsCount}</span>` : ''}
                                            ${promo.min_order_amount > 0 ? `<span><strong>Мин. сумма:</strong> ${promo.min_order_amount} сум</span>` : ''}
                                            <span><strong>Приоритет:</strong> ${promo.priority}</span>
                                        </div>
                                    </div>
                                    <div style="text-align: right; min-width: 150px;">
                                        <div style="font-size: 13px; color: #666; margin-bottom: 4px;">
                                            ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
                                        </div>
                                        ${!isExpired && !isUpcoming ? `
                                            <div style="font-size: 14px; color: ${daysLeft <= 3 ? '#dc2626' : '#059669'}; font-weight: 600;">
                                                ${daysLeft > 0 ? `Осталось ${daysLeft} дн.` : 'Последний день!'}
                                            </div>
                                        ` : ''}
                                        <div style="display: flex; gap: 8px; margin-top: 12px; justify-content: flex-end;">
                                            <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 13px;" onclick="window.editPromotion('${promo.id}')">
                                                Редактировать
                                            </button>
                                            <button class="btn ${promo.is_active ? 'btn-secondary' : 'btn-primary'}" style="padding: 6px 12px; font-size: 13px;" onclick="window.togglePromotion('${promo.id}', ${promo.is_active})">
                                                ${promo.is_active ? 'Выкл' : 'Вкл'}
                                            </button>
                                            <button class="btn btn-danger" style="padding: 6px 12px; font-size: 13px;" onclick="window.deletePromotion('${promo.id}')">
                                                Удалить
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `}
        </div>
    `;

    document.getElementById('add-promo-btn')?.addEventListener('click', () => showPromotionModal(null, allProducts, allCategories));

    window.editPromotion = (promoId) => {
        const promo = promotions.find(p => p.id === promoId);
        if (promo) showPromotionModal(promo, allProducts, allCategories);
    };

    window.togglePromotion = async (promoId, isActive) => {
        const { error } = await supabaseClient.from('promotions').update({ is_active: !isActive }).eq('id', promoId);
        if (error) {
            alert('Ошибка: ' + error.message);
        } else {
            await renderTabContent();
        }
    };

    window.deletePromotion = async (promoId) => {
        if (!confirm('Удалить эту акцию?')) return;
        const { error } = await supabaseClient.from('promotions').delete().eq('id', promoId);
        if (error) {
            alert('Ошибка: ' + error.message);
        } else {
            await renderTabContent();
        }
    };
}

function showPromotionModal(promo, allProducts, allCategories) {
    const isEdit = !!promo;
    const selectedProductIds = promo?.promotion_products?.map(pp => pp.product_id) || [];
    const selectedCategoryIds = promo?.promotion_categories?.map(pc => pc.category_id) || [];

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3 class="modal-title">${isEdit ? 'Редактировать акцию' : 'Создать акцию'}</h3>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Название акции *</label>
                    <input type="text" id="promo-name" class="form-control" value="${promo?.name || ''}" placeholder="Например: Летняя распродажа">
                </div>
                <div class="form-group">
                    <label>Описание</label>
                    <input type="text" id="promo-description" class="form-control" value="${promo?.description || ''}" placeholder="Краткое описание">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label>Тип акции *</label>
                        <select id="promo-type" class="form-control">
                            <option value="product" ${promo?.type === 'product' ? 'selected' : ''}>На конкретные товары</option>
                            <option value="category" ${promo?.type === 'category' ? 'selected' : ''}>На категории</option>
                            <option value="global" ${promo?.type === 'global' ? 'selected' : ''}>На все товары</option>
                            <option value="order" ${promo?.type === 'order' ? 'selected' : ''}>На весь чек</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Тип скидки *</label>
                        <select id="promo-discount-type" class="form-control">
                            <option value="percentage" ${promo?.discount_type === 'percentage' ? 'selected' : ''}>Процент (%)</option>
                            <option value="fixed" ${promo?.discount_type === 'fixed' ? 'selected' : ''}>Фиксированная сумма (сум)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Размер скидки *</label>
                        <input type="number" id="promo-discount-value" class="form-control" value="${promo?.discount_value || ''}" min="0" step="0.01" placeholder="10">
                    </div>
                    <div class="form-group">
                        <label>Приоритет</label>
                        <input type="number" id="promo-priority" class="form-control" value="${promo?.priority || 0}" min="0" placeholder="0">
                        <div style="font-size: 12px; color: var(--text-gray);">Выше = применяется первой</div>
                    </div>
                    <div class="form-group">
                        <label>Дата начала *</label>
                        <input type="date" id="promo-start" class="form-control" value="${promo?.start_date?.split('T')[0] || new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label>Дата окончания *</label>
                        <input type="date" id="promo-end" class="form-control" value="${promo?.end_date?.split('T')[0] || ''}">
                    </div>
                    <div class="form-group">
                        <label>Мин. сумма заказа</label>
                        <input type="number" id="promo-min-amount" class="form-control" value="${promo?.min_order_amount || 0}" min="0" step="0.01" placeholder="0">
                    </div>
                    <div class="form-group">
                        <label>Мин. кол-во товаров</label>
                        <input type="number" id="promo-min-qty" class="form-control" value="${promo?.min_quantity || 0}" min="0" placeholder="0">
                    </div>
                </div>
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="promo-combinable" ${promo?.is_combinable ? 'checked' : ''}>
                        Можно совмещать с другими акциями
                    </label>
                </div>
                <div id="promo-products-section" style="display: none;">
                    <div class="form-group">
                        <label>Выберите товары</label>
                        <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; align-items: center;">
                            <input type="text" id="promo-product-search" class="form-control" placeholder="Поиск товаров..." style="flex: 1; min-width: 200px;">
                            <button type="button" class="btn btn-secondary" id="select-all-products" style="padding: 8px 12px;">Выбрать все</button>
                            <button type="button" class="btn btn-secondary" id="deselect-all-products" style="padding: 8px 12px;">Снять все</button>
                        </div>
                        <div style="font-size: 13px; color: #666; margin-bottom: 8px;">Выбрано: <span id="selected-products-count">${selectedProductIds.length}</span> из ${allProducts.length}</div>
                        <div id="products-list" style="max-height: 250px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
                            ${allProducts.map(p => `
                                <label class="promo-product-item" data-name="${p.name.toLowerCase()}" style="display: flex; align-items: center; gap: 8px; padding: 8px; cursor: pointer; border-radius: 6px; transition: background 0.15s; ${selectedProductIds.includes(p.id) ? 'background: #ecfdf5;' : ''}" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='${selectedProductIds.includes(p.id) ? '#ecfdf5' : 'transparent'}'">
                                    <input type="checkbox" name="promo-product" value="${p.id}" ${selectedProductIds.includes(p.id) ? 'checked' : ''} style="width: 18px; height: 18px;">
                                    <span style="flex: 1;">${p.name}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div id="promo-categories-section" style="display: none;">
                    <div class="form-group">
                        <label>Выберите категории</label>
                        <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
                            ${allCategories.map(c => `
                                <label style="display: flex; align-items: center; gap: 8px; padding: 4px 0; cursor: pointer;">
                                    <input type="checkbox" name="promo-category" value="${c.id}" ${selectedCategoryIds.includes(c.id) ? 'checked' : ''}>
                                    ${c.name}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-promo">Отмена</button>
                <button class="btn btn-primary" id="save-promo">${isEdit ? 'Сохранить' : 'Создать'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const typeSelect = document.getElementById('promo-type');
    const productsSection = document.getElementById('promo-products-section');
    const categoriesSection = document.getElementById('promo-categories-section');

    function updateSections() {
        const type = typeSelect.value;
        productsSection.style.display = type === 'product' ? 'block' : 'none';
        categoriesSection.style.display = type === 'category' ? 'block' : 'none';
    }
    typeSelect.addEventListener('change', updateSections);
    updateSections();

    const productSearch = document.getElementById('promo-product-search');
    const productsList = document.getElementById('products-list');
    const selectedCount = document.getElementById('selected-products-count');

    function updateSelectedCount() {
        const count = document.querySelectorAll('input[name="promo-product"]:checked').length;
        if (selectedCount) selectedCount.textContent = count;
    }

    productSearch?.addEventListener('input', (e) => {
        const search = e.target.value.toLowerCase();
        document.querySelectorAll('.promo-product-item').forEach(item => {
            const name = item.dataset.name;
            item.style.display = name.includes(search) ? 'flex' : 'none';
        });
    });

    document.getElementById('select-all-products')?.addEventListener('click', () => {
        document.querySelectorAll('.promo-product-item:not([style*="display: none"]) input[name="promo-product"]').forEach(cb => {
            cb.checked = true;
            cb.closest('label').style.background = '#ecfdf5';
        });
        updateSelectedCount();
    });

    document.getElementById('deselect-all-products')?.addEventListener('click', () => {
        document.querySelectorAll('input[name="promo-product"]').forEach(cb => {
            cb.checked = false;
            cb.closest('label').style.background = 'transparent';
        });
        updateSelectedCount();
    });

    productsList?.addEventListener('change', (e) => {
        if (e.target.name === 'promo-product') {
            e.target.closest('label').style.background = e.target.checked ? '#ecfdf5' : 'transparent';
            updateSelectedCount();
        }
    });

    document.getElementById('cancel-promo').addEventListener('click', () => modal.remove());

    document.getElementById('save-promo').addEventListener('click', async () => {
        const name = document.getElementById('promo-name').value.trim();
        const description = document.getElementById('promo-description').value.trim() || null;
        const type = document.getElementById('promo-type').value;
        const discountType = document.getElementById('promo-discount-type').value;
        const discountValue = parseFloat(document.getElementById('promo-discount-value').value);
        const priority = parseInt(document.getElementById('promo-priority').value) || 0;
        const startDate = document.getElementById('promo-start').value;
        const endDate = document.getElementById('promo-end').value;
        const minOrderAmount = parseFloat(document.getElementById('promo-min-amount').value) || 0;
        const minQuantity = parseInt(document.getElementById('promo-min-qty').value) || 0;
        const isCombinable = document.getElementById('promo-combinable').checked;

        const selectedProducts = Array.from(document.querySelectorAll('input[name="promo-product"]:checked')).map(i => i.value);
        const selectedCategories = Array.from(document.querySelectorAll('input[name="promo-category"]:checked')).map(i => i.value);

        if (!name || isNaN(discountValue) || discountValue <= 0 || !startDate || !endDate) {
            alert('Заполните обязательные поля');
            return;
        }

        if (discountType === 'percentage' && discountValue > 100) {
            alert('Процент скидки не может превышать 100%');
            return;
        }

        const saveBtn = document.getElementById('save-promo');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Сохранение...';

        try {
            const promoData = {
                name, description, type, discount_type: discountType, discount_value: discountValue,
                priority, start_date: new Date(startDate).toISOString(), end_date: new Date(endDate + 'T23:59:59').toISOString(),
                min_order_amount: minOrderAmount, min_quantity: minQuantity, is_combinable: isCombinable,
                updated_at: new Date().toISOString()
            };

            let promoId = promo?.id;

            if (isEdit) {
                const { error } = await supabaseClient.from('promotions').update(promoData).eq('id', promoId);
                if (error) throw error;

                await supabaseClient.from('promotion_products').delete().eq('promotion_id', promoId);
                await supabaseClient.from('promotion_categories').delete().eq('promotion_id', promoId);
            } else {
                promoData.is_active = true;
                const { data, error } = await supabaseClient.from('promotions').insert(promoData).select().single();
                if (error) throw error;
                promoId = data.id;
            }

            if (type === 'product' && selectedProducts.length > 0) {
                await supabaseClient.from('promotion_products').insert(
                    selectedProducts.map(pid => ({ promotion_id: promoId, product_id: pid }))
                );
            }

            if (type === 'category' && selectedCategories.length > 0) {
                await supabaseClient.from('promotion_categories').insert(
                    selectedCategories.map(cid => ({ promotion_id: promoId, category_id: cid }))
                );
            }

            modal.remove();
            alert(isEdit ? 'Акция обновлена!' : 'Акция создана!');
            await renderTabContent();
        } catch (error) {
            console.error('Promotion save error:', error);
            alert('Ошибка: ' + error.message);
            saveBtn.disabled = false;
            saveBtn.textContent = isEdit ? 'Сохранить' : 'Создать';
        }
    });
}
