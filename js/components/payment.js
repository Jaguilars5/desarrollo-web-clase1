export function buildPaymentSummary(cart) {
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    total,
    html: `
        <div class="payment-summary-title">Resumen del pedido</div>
        ${cart
          .map(
            (i) => `
            <div class="payment-summary-item">
                <span>${i.name} x${i.quantity}</span>
                <span>$${(i.price * i.quantity).toFixed(2)}</span>
            </div>
        `,
          )
          .join("")}
        <div class="payment-summary-total">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        </div>
    `,
  };
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateExpiry(expiry) {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = parseInt(match[1], 10);
  const year = parseInt("20" + match[2], 10);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const exp = new Date(year, month - 1, 1);
  return exp >= new Date(now.getFullYear(), now.getMonth(), 1);
}
