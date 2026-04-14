export function renderStoreGrid(products, searchTerm) {
  const grid = document.getElementById("product-grid");
  const normalizedSearch = searchTerm.toLowerCase();
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(normalizedSearch),
  );

  if (products.length === 0) {
    grid.innerHTML =
      '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:48px 0;">No hay productos disponibles.</p>';
    return;
  }

  if (filteredProducts.length === 0) {
    grid.innerHTML =
      '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:48px 0;">No se encontraron productos para tu busqueda.</p>';
    return;
  }

  grid.innerHTML = filteredProducts
    .map(
      (p) => `
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
    `,
    )
    .join("");
}
