export function renderAdminTable(products) {
  const tbody = document.getElementById("admin-product-list");

  if (products.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-muted);">No hay productos registrados.</td></tr>';
    return;
  }

  tbody.innerHTML = products
    .map(
      (p) => `
        <tr id="row-${p.id}">
            <td><img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/48?text=N/A'"></td>
            <td id="name-cell-${p.id}">${p.name}</td>
            <td id="price-cell-${p.id}">$${p.price.toFixed(2)}</td>
            <td class="text-center">
                <button class="btn-edit" onclick="startEdit(${p.id})">Editar</button>
                <button class="btn-delete" onclick="deleteProduct(${p.id})">Eliminar</button>
            </td>
        </tr>
    `,
    )
    .join("");
}
