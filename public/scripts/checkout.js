import { renderOrderSummary } from './checkout/orderSummary.js';
import { renderPaymentSummary } from './checkout/paymentSummary.js';
import { loadProductsFetch } from '../data/products.js';
import { loadCart, cart } from '../data/cart.js';

async function loadPage() {
  try {
    // Load products
    await loadProductsFetch();

    // Load cart
    await new Promise((resolve) => {
      loadCart(() => {
        resolve();
      });
    });

    // Calculate total quantity
    let cartQuantity = 0;

    cart.forEach((cartItem) => {
      cartQuantity += cartItem.quantity;
    });

    // Update checkout header
    document.querySelector('.js-return-to-home-link').innerHTML =
      `${cartQuantity} items`;

    // Render checkout page
    renderOrderSummary();
    renderPaymentSummary();

  } catch (error) {
    console.error(error);
    alert('Unexpected error. Please try again later.');
  }
}

loadPage();