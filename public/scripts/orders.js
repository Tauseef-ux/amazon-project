import { getProduct, loadProductsFetch } from '../data/products.js';
import { formatCurrency } from './utils/money.js';

async function loadPage() {
  try {
    await loadProductsFetch();

    const response = await fetch('/orders');
    const orders = await response.json();

    renderOrders(orders);
  } catch (error) {
    console.log('Unexpected error. Please try again later.');
  }
}

function formatDate(ms) {
  const date = new Date(ms);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  });
}

function renderOrders(orders) {
  if (!orders || orders.length === 0) {
    document.querySelector('.js-orders-grid').innerHTML = `
      <div class="order-container">
        <div class="order-header">
          <div class="order-header-left-section">
            No orders placed yet.
          </div>
        </div>
      </div>
    `;
    return;
  }

  let ordersHTML = '';

  orders.forEach((order) => {
    let productsHTML = '';

    order.products.forEach((orderProduct) => {
      const product = getProduct(orderProduct.productId);
      if (!product) return;

      productsHTML += `
        <div class="product-image-container">
          <img src="${product.image}">
        </div>

        <div class="product-details">
          <div class="product-name">
            ${product.name}
          </div>
          <div class="product-delivery-date">
            Arriving on: ${formatDate(orderProduct.estimatedDeliveryTimeMs)}
          </div>
          <div class="product-quantity">
            Quantity: ${orderProduct.quantity}
          </div>
          <button class="buy-again-button button-primary js-buy-again"
            data-product-id="${product.id}">
            <img class="buy-again-icon" src="images/icons/buy-again.png">
            <span class="buy-again-message">Buy it again</span>
          </button>
        </div>

        <div class="product-actions">
          <a href="tracking.html?orderId=${order.id}&productId=${product.id}">
            <button class="track-package-button button-secondary">
              Track package
            </button>
          </a>
        </div>
      `;
    });

    ordersHTML += `
      <div class="order-container">
        <div class="order-header">
          <div class="order-header-left-section">
            <div class="order-date">
              <div class="order-header-label">Order Placed:</div>
              <div>${formatDate(order.orderTimeMs)}</div>
            </div>
            <div class="order-total">
              <div class="order-header-label">Total:</div>
              <div>$${formatCurrency(order.totalCostCents)}</div>
            </div>
          </div>

          <div class="order-header-right-section">
            <div class="order-header-label">Order ID:</div>
            <div>${order.id}</div>
          </div>
        </div>

        <div class="order-details-grid">
          ${productsHTML}
        </div>
      </div>
    `;
  });

  document.querySelector('.js-orders-grid').innerHTML = ordersHTML;
}

loadPage();
