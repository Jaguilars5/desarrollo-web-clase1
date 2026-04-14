export function renderCartItems(cart) {
  const container = document.getElementById("cart-items");

  if (cart.length === 0) {
    container.innerHTML =
      '<div class="cart-empty">Tu carrito esta vacio.</div>';
    document.getElementById("cart-total-sum").textContent = "0.00";
    return;
  }

  container.innerHTML = cart
    .map(
      (item) => `
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
    `,
    )
    .join("");

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  document.getElementById("cart-total-sum").textContent = total.toFixed(2);
}

export function updateCartBadgeCount(cart) {
  const total = cart.reduce((sum, i) => sum + i.quantity, 0);
  document.getElementById("cart-count").textContent = total;
}

export function setCartVisibility(isOpen) {
  const sidebar = document.getElementById("cart-sidebar");
  const overlay = document.getElementById("cart-overlay");

  if (isOpen) {
    sidebar.classList.add("open");
    overlay.classList.remove("hidden");
    return;
  }

  sidebar.classList.remove("open");
  overlay.classList.add("hidden");
}
