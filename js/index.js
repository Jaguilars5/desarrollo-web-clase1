// index.js — Logica principal del e-commerce

// =============================================
// ESTADO
// =============================================

let products = [...MOCK_PRODUCTS];
let nextId = products.length + 1;
let cart = [];
let cartOpen = false;

// Estado del modal de producto
let modalProduct = null;
let modalQuantity = 1;

// =============================================
// RENDER — TIENDA
// =============================================

function renderStore() {
    const grid = document.getElementById('product-grid');
    if (products.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:48px 0;">No hay productos disponibles.</p>';
        return;
    }
    grid.innerHTML = products.map(p => `
        <div class="product-card" onclick="openProductModal(${p.id})">
            <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/400x200?text=Sin+imagen'">
            <div class="product-card-body">
                <div class="product-card-name" title="${p.name}">${p.name}</div>
                <div class="product-card-price">$${p.price.toFixed(2)}</div>
                <button class="product-card-btn" onclick="event.stopPropagation(); openProductModal(${p.id})">
                    Agregar al carrito
                </button>
            </div>
        </div>
    `).join('');
}

// =============================================
// RENDER — ADMIN
// =============================================

function renderAdmin() {
    const tbody = document.getElementById('admin-product-list');
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-muted);">No hay productos registrados.</td></tr>';
        return;
    }
    tbody.innerHTML = products.map(p => `
        <tr id="row-${p.id}">
            <td><img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/48?text=N/A'"></td>
            <td id="name-cell-${p.id}">${p.name}</td>
            <td id="price-cell-${p.id}">$${p.price.toFixed(2)}</td>
            <td class="text-center">
                <button class="btn-edit" onclick="startEdit(${p.id})">Editar</button>
                <button class="btn-delete" onclick="deleteProduct(${p.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

// =============================================
// CRUD
// =============================================

function createProduct() {
    const name  = document.getElementById('new-name').value.trim();
    const price = parseFloat(document.getElementById('new-price').value);
    const image = document.getElementById('new-image').value.trim();

    if (!name || isNaN(price) || price <= 0) {
        alert('Por favor ingrese un nombre y precio validos.');
        return;
    }

    products.push({
        id: nextId++,
        name,
        price,
        image: image || 'https://via.placeholder.com/400x200?text=Producto'
    });

    document.getElementById('new-name').value  = '';
    document.getElementById('new-price').value = '';
    document.getElementById('new-image').value = '';

    renderAdmin();
    renderStore();
}

function startEdit(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;

    document.getElementById(`name-cell-${id}`).innerHTML =
        `<input class="admin-edit-input" id="edit-name-${id}" value="${p.name}">`;
    document.getElementById(`price-cell-${id}`).innerHTML =
        `<input class="admin-edit-input" id="edit-price-${id}" value="${p.price}" type="number" min="0.01" step="0.01" style="width:90px">`;

    const actionsCell = document.querySelector(`#row-${id} td:last-child`);
    actionsCell.innerHTML = `
        <button class="btn-save" onclick="saveEdit(${id})">Guardar</button>
        <button class="btn-delete" onclick="cancelEdit(${id})">Cancelar</button>
    `;
}

function saveEdit(id) {
    const nameInput  = document.getElementById(`edit-name-${id}`);
    const priceInput = document.getElementById(`edit-price-${id}`);

    const newName  = nameInput ? nameInput.value.trim() : '';
    const newPrice = priceInput ? parseFloat(priceInput.value) : NaN;

    if (!newName || isNaN(newPrice) || newPrice <= 0) {
        alert('Nombre y precio son requeridos y deben ser validos.');
        return;
    }

    const p = products.find(x => x.id === id);
    if (p) {
        p.name  = newName;
        p.price = newPrice;
    }

    renderAdmin();
    renderStore();
}

function cancelEdit(id) {
    renderAdmin();
}

function deleteProduct(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    products = products.filter(p => p.id !== id);
    cart = cart.filter(c => c.id !== id);
    renderAdmin();
    renderStore();
    renderCart();
}

// =============================================
// MODAL DE PRODUCTO
// =============================================

function openProductModal(id) {
    modalProduct = products.find(p => p.id === id);
    if (!modalProduct) return;
    modalQuantity = 1;

    document.getElementById('modal-img').src = modalProduct.image;
    document.getElementById('modal-img').alt = modalProduct.name;
    document.getElementById('modal-name').textContent = modalProduct.name;
    document.getElementById('modal-unit-price-val').textContent = modalProduct.price.toFixed(2);
    document.getElementById('modal-quantity').textContent = modalQuantity;
    document.getElementById('modal-total-price').textContent = modalProduct.price.toFixed(2);

    document.getElementById('product-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('product-modal').classList.add('hidden');
    modalProduct = null;
}

function updateModalQuantity(delta) {
    modalQuantity = Math.max(1, modalQuantity + delta);
    document.getElementById('modal-quantity').textContent = modalQuantity;
    document.getElementById('modal-total-price').textContent =
        (modalProduct.price * modalQuantity).toFixed(2);
}

function confirmAddToCart() {
    if (!modalProduct) return;
    addToCart(modalProduct, modalQuantity);
    closeModal();
}

// =============================================
// CARRITO
// =============================================

function addToCart(product, quantity = 1) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }
    renderCart();
    updateCartBadge();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    if (cart.length === 0) {
        container.innerHTML = '<div class="cart-empty">Tu carrito esta vacio.</div>';
        document.getElementById('cart-total-sum').textContent = '0.00';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/56?text=N/A'">
            <div class="cart-item-info">
                <div class="cart-item-name" title="${item.name}">${item.name}</div>
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
            <div class="cart-item-controls">
                <button class="cart-qty-btn" onclick="changeCartQty(${item.id}, -1)">-</button>
                <span class="cart-qty-num">${item.quantity}</span>
                <button class="cart-qty-btn" onclick="changeCartQty(${item.id}, 1)">+</button>
                <button class="cart-remove" onclick="removeFromCart(${item.id})">&#215;</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    document.getElementById('cart-total-sum').textContent = total.toFixed(2);
}

function changeCartQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    renderCart();
    updateCartBadge();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    renderCart();
    updateCartBadge();
}

function updateCartBadge() {
    const total = cart.reduce((sum, i) => sum + i.quantity, 0);
    document.getElementById('cart-count').textContent = total;
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    cartOpen = !cartOpen;
    if (cartOpen) {
        sidebar.classList.add('open');
        overlay.classList.remove('hidden');
    } else {
        sidebar.classList.remove('open');
        overlay.classList.add('hidden');
    }
}

// =============================================
// PASARELA DE PAGO (SIMULACION)
// =============================================

function checkout() {
    if (cart.length === 0) {
        alert('Tu carrito esta vacio.');
        return;
    }

    // Cerrar carrito
    if (cartOpen) toggleCart();

    // Construir resumen
    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const summaryEl = document.getElementById('payment-summary');
    summaryEl.innerHTML = `
        <div class="payment-summary-title">Resumen del pedido</div>
        ${cart.map(i => `
            <div class="payment-summary-item">
                <span>${i.name} x${i.quantity}</span>
                <span>$${(i.price * i.quantity).toFixed(2)}</span>
            </div>
        `).join('')}
        <div class="payment-summary-total">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        </div>
    `;

    document.getElementById('payment-amount').textContent = total.toFixed(2);
    document.getElementById('pay-name').value    = '';
    document.getElementById('pay-email').value   = '';
    document.getElementById('pay-card-number').value = '';
    document.getElementById('pay-expiry').value  = '';
    document.getElementById('pay-cvv').value     = '';
    document.getElementById('pay-error').classList.add('hidden');
    document.getElementById('pay-btn-text').classList.remove('hidden');
    document.getElementById('pay-btn-loading').classList.add('hidden');
    document.getElementById('submit-payment').disabled = false;

    document.getElementById('payment-modal').classList.remove('hidden');
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.add('hidden');
}

function submitPayment() {
    const name   = document.getElementById('pay-name').value.trim();
    const email  = document.getElementById('pay-email').value.trim();
    const card   = document.getElementById('pay-card-number').value.replace(/\s/g, '');
    const expiry = document.getElementById('pay-expiry').value.trim();
    const cvv    = document.getElementById('pay-cvv').value.trim();

    const errorEl = document.getElementById('pay-error');

    // Validaciones basicas
    if (!name) {
        showPayError('Por favor ingrese su nombre completo.'); return;
    }
    if (!validateEmail(email)) {
        showPayError('Por favor ingrese un correo electronico valido.'); return;
    }
    if (card.length !== 16 || isNaN(card)) {
        showPayError('El numero de tarjeta debe tener 16 digitos.'); return;
    }
    if (!validateExpiry(expiry)) {
        showPayError('Fecha de vencimiento invalida o expirada (MM/AA).'); return;
    }
    if (cvv.length < 3 || isNaN(cvv)) {
        showPayError('El CVV debe tener 3 digitos.'); return;
    }

    errorEl.classList.add('hidden');

    // Mostrar estado de procesando
    document.getElementById('pay-btn-text').classList.add('hidden');
    document.getElementById('pay-btn-loading').classList.remove('hidden');
    document.getElementById('submit-payment').disabled = true;

    // Simular latencia de red
    setTimeout(() => {
        const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

        closePaymentModal();

        document.getElementById('success-message').textContent =
            `Pago de $${total.toFixed(2)} procesado correctamente. ` +
            `Se enviara confirmacion a ${email}.`;

        document.getElementById('success-modal').classList.remove('hidden');

        // Limpiar carrito
        cart = [];
        renderCart();
        updateCartBadge();
    }, 2000);
}

function showPayError(msg) {
    const el = document.getElementById('pay-error');
    el.textContent = msg;
    el.classList.remove('hidden');
}

function closeSuccessModal() {
    document.getElementById('success-modal').classList.add('hidden');
}

// =============================================
// FORMATEO DE INPUTS DE TARJETA
// =============================================

function formatCardNumber(input) {
    let v = input.value.replace(/\D/g, '').substring(0, 16);
    input.value = v.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(input) {
    let v = input.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 3) {
        v = v.substring(0, 2) + '/' + v.substring(2);
    }
    input.value = v;
}

// =============================================
// VALIDACIONES
// =============================================

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateExpiry(expiry) {
    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    const month = parseInt(match[1], 10);
    const year  = parseInt('20' + match[2], 10);
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const exp = new Date(year, month - 1, 1);
    return exp >= new Date(now.getFullYear(), now.getMonth(), 1);
}

// =============================================
// VISTAS
// =============================================

function toggleView(view) {
    document.getElementById('store-view').classList.toggle('hidden', view !== 'store');
    document.getElementById('admin-view').classList.toggle('hidden', view !== 'admin');
}

// =============================================
// INICIALIZACION
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    renderStore();
    renderAdmin();
    updateCartBadge();

    // Cerrar modals con Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeModal();
            closePaymentModal();
            closeSuccessModal();
            if (cartOpen) toggleCart();
        }
    });

    // Cerrar modal de producto al hacer clic fuera
    document.getElementById('product-modal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    document.getElementById('payment-modal').addEventListener('click', function(e) {
        if (e.target === this) closePaymentModal();
    });
    document.getElementById('success-modal').addEventListener('click', function(e) {
        if (e.target === this) closeSuccessModal();
    });
});