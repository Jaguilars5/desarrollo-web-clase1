import { renderAdminTable } from "./components/admin.js";
import {
  renderCartItems,
  setCartVisibility,
  updateCartBadgeCount,
} from "./components/cart.js";
import {
  buildPaymentSummary,
  validateEmail,
  validateExpiry,
} from "./components/payment.js";
import { renderStoreGrid } from "./components/store.js";

const initialProducts =
  typeof MOCK_PRODUCTS !== "undefined"
    ? MOCK_PRODUCTS
    : Array.isArray(window.MOCK_PRODUCTS)
      ? window.MOCK_PRODUCTS
      : [];

let products = [...initialProducts];
let nextId = products.length + 1;
let cart = [];
let cartOpen = false;
let storeSearchTerm = "";
let modalProduct = null;
let modalQuantity = 1;

function renderStore() {
  renderStoreGrid(products, storeSearchTerm);
}

function renderAdmin() {
  renderAdminTable(products);
}

function createProduct() {
  const name = document.getElementById("new-name").value.trim();
  const price = parseFloat(document.getElementById("new-price").value);
  const image = document.getElementById("new-image").value.trim();

  if (!name || isNaN(price) || price <= 0) {
    alert("Por favor ingrese un nombre y precio validos.");
    return;
  }

  products.push({
    id: nextId++,
    name,
    price,
    image: image || "https://via.placeholder.com/400x200?text=Producto",
  });

  document.getElementById("new-name").value = "";
  document.getElementById("new-price").value = "";
  document.getElementById("new-image").value = "";

  renderAdmin();
  renderStore();
}

function startEdit(id) {
  const p = products.find((x) => x.id === id);
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
  const nameInput = document.getElementById(`edit-name-${id}`);
  const priceInput = document.getElementById(`edit-price-${id}`);

  const newName = nameInput ? nameInput.value.trim() : "";
  const newPrice = priceInput ? parseFloat(priceInput.value) : NaN;

  if (!newName || isNaN(newPrice) || newPrice <= 0) {
    alert("Nombre y precio son requeridos y deben ser validos.");
    return;
  }

  const p = products.find((x) => x.id === id);
  if (p) {
    p.name = newName;
    p.price = newPrice;
  }

  renderAdmin();
  renderStore();
}

function cancelEdit() {
  renderAdmin();
}

function deleteProduct(id) {
  if (!confirm("¿Eliminar este producto?")) return;

  products = products.filter((p) => p.id !== id);
  cart = cart.filter((c) => c.id !== id);
  renderAdmin();
  renderStore();
  renderCart();
}

function openProductModal(id) {
  modalProduct = products.find((p) => p.id === id);
  if (!modalProduct) return;

  modalQuantity = 1;

  document.getElementById("modal-img").src = modalProduct.image;
  document.getElementById("modal-img").alt = modalProduct.name;
  document.getElementById("modal-name").textContent = modalProduct.name;
  document.getElementById("modal-unit-price-val").textContent =
    modalProduct.price.toFixed(2);
  document.getElementById("modal-quantity").textContent = modalQuantity;
  document.getElementById("modal-total-price").textContent =
    modalProduct.price.toFixed(2);

  document.getElementById("product-modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("product-modal").classList.add("hidden");
  modalProduct = null;
}

function updateModalQuantity(delta) {
  modalQuantity = Math.max(1, modalQuantity + delta);
  document.getElementById("modal-quantity").textContent = modalQuantity;
  document.getElementById("modal-total-price").textContent = (
    modalProduct.price * modalQuantity
  ).toFixed(2);
}

function confirmAddToCart() {
  if (!modalProduct) return;

  addToCart(modalProduct, modalQuantity);
  closeModal();
}

function addToCart(product, quantity = 1) {
  const existing = cart.find((i) => i.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  renderCart();
  updateCartBadge();
}

function renderCart() {
  renderCartItems(cart);
}

function changeCartQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter((i) => i.id !== id);
  }

  renderCart();
  updateCartBadge();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  renderCart();
  updateCartBadge();
}

function updateCartBadge() {
  updateCartBadgeCount(cart);
}

function toggleCart() {
  cartOpen = !cartOpen;
  setCartVisibility(cartOpen);
}

function checkout() {
  if (cart.length === 0) {
    alert("Tu carrito esta vacio.");
    return;
  }

  if (cartOpen) toggleCart();

  const { total, html } = buildPaymentSummary(cart);
  document.getElementById("payment-summary").innerHTML = html;

  document.getElementById("payment-amount").textContent = total.toFixed(2);
  document.getElementById("pay-name").value = "";
  document.getElementById("pay-email").value = "";
  document.getElementById("pay-card-number").value = "";
  document.getElementById("pay-expiry").value = "";
  document.getElementById("pay-cvv").value = "";
  document.getElementById("pay-error").classList.add("hidden");
  document.getElementById("pay-btn-text").classList.remove("hidden");
  document.getElementById("pay-btn-loading").classList.add("hidden");
  document.getElementById("submit-payment").disabled = false;
  document.getElementById("payment-modal").classList.remove("hidden");
}

function closePaymentModal() {
  document.getElementById("payment-modal").classList.add("hidden");
}

function submitPayment() {
  const name = document.getElementById("pay-name").value.trim();
  const email = document.getElementById("pay-email").value.trim();
  const card = document
    .getElementById("pay-card-number")
    .value.replace(/\s/g, "");
  const expiry = document.getElementById("pay-expiry").value.trim();
  const cvv = document.getElementById("pay-cvv").value.trim();

  if (!name) {
    showPayError("Por favor ingrese su nombre completo.");
    return;
  }

  if (!validateEmail(email)) {
    showPayError("Por favor ingrese un correo electronico valido.");
    return;
  }

  if (card.length !== 16 || isNaN(card)) {
    showPayError("El numero de tarjeta debe tener 16 digitos.");
    return;
  }

  if (!validateExpiry(expiry)) {
    showPayError("Fecha de vencimiento invalida o expirada (MM/AA).");
    return;
  }

  if (cvv.length < 3 || isNaN(cvv)) {
    showPayError("El CVV debe tener 3 digitos.");
    return;
  }

  document.getElementById("pay-error").classList.add("hidden");
  document.getElementById("pay-btn-text").classList.add("hidden");
  document.getElementById("pay-btn-loading").classList.remove("hidden");
  document.getElementById("submit-payment").disabled = true;

  setTimeout(() => {
    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    closePaymentModal();
    document.getElementById("success-message").textContent =
      `Pago de $${total.toFixed(2)} procesado correctamente. ` +
      `Se enviara confirmacion a ${email}.`;
    document.getElementById("success-modal").classList.remove("hidden");

    cart = [];
    renderCart();
    updateCartBadge();
  }, 2000);
}

function showPayError(msg) {
  const el = document.getElementById("pay-error");
  el.textContent = msg;
  el.classList.remove("hidden");
}

function closeSuccessModal() {
  document.getElementById("success-modal").classList.add("hidden");
}

function formatCardNumber(input) {
  let value = input.value.replace(/\D/g, "").substring(0, 16);
  input.value = value.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(input) {
  let value = input.value.replace(/\D/g, "").substring(0, 4);
  if (value.length >= 3) {
    value = value.substring(0, 2) + "/" + value.substring(2);
  }
  input.value = value;
}

function toggleView(view) {
  document
    .getElementById("store-view")
    .classList.toggle("hidden", view !== "store");
  document
    .getElementById("admin-view")
    .classList.toggle("hidden", view !== "admin");
}

function bindGlobalHandlers() {
  Object.assign(window, {
    toggleView,
    toggleCart,
    createProduct,
    startEdit,
    saveEdit,
    cancelEdit,
    deleteProduct,
    openProductModal,
    closeModal,
    updateModalQuantity,
    confirmAddToCart,
    changeCartQty,
    removeFromCart,
    checkout,
    closePaymentModal,
    submitPayment,
    closeSuccessModal,
    formatCardNumber,
    formatExpiry,
  });
}

function bindUiEvents() {
  const searchInput = document.getElementById("store-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      storeSearchTerm = e.target.value.trim();
      renderStore();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closePaymentModal();
      closeSuccessModal();
      if (cartOpen) toggleCart();
    }
  });

  document
    .getElementById("product-modal")
    .addEventListener("click", function (e) {
      if (e.target === this) closeModal();
    });

  document
    .getElementById("payment-modal")
    .addEventListener("click", function (e) {
      if (e.target === this) closePaymentModal();
    });

  document
    .getElementById("success-modal")
    .addEventListener("click", function (e) {
      if (e.target === this) closeSuccessModal();
    });
}

document.addEventListener("DOMContentLoaded", () => {
  bindGlobalHandlers();
  renderStore();
  renderAdmin();
  renderCart();
  updateCartBadge();
  bindUiEvents();
});
