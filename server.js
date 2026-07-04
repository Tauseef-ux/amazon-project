const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

// Make sure orders.json exists
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, '[]');
}

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// In-memory cart (per server instance, matches the simple tutorial backend behavior)
let cart = [
  { productId: 'e43638ce-6aa0-4b85-b27f-e1d07eb678c6', quantity: 2, deliveryOptionId: '1' },
  { productId: '15b6fc6f-327a-4ec4-896f-486349e85a3d', quantity: 1, deliveryOptionId: '2' }
];

const deliveryOptions = [
  { id: '1', deliveryDays: 7, priceCents: 0 },
  { id: '2', deliveryDays: 3, priceCents: 499 },
  { id: '3', deliveryDays: 1, priceCents: 999 }
];

function getProduct(productId) {
  const products = readJSON(PRODUCTS_FILE);
  return products.find((p) => p.id === productId);
}

function getDeliveryOption(deliveryOptionId) {
  return deliveryOptions.find((d) => d.id === deliveryOptionId) || deliveryOptions[0];
}

// ----------------- PRODUCTS -----------------

app.get('/products', (req, res) => {
  const products = readJSON(PRODUCTS_FILE);
  res.json(products);
});

app.get('/products/:productId', (req, res) => {
  const product = getProduct(req.params.productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// ----------------- CART -----------------

app.get('/cart', (req, res) => {
  res.json(cart);
});

app.post('/cart', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = getProduct(productId);
  if (!product) return res.status(400).json({ error: 'Invalid productId' });

  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity, deliveryOptionId: '1' });
  }
  res.status(201).json(cart);
});

app.put('/cart/:productId', (req, res) => {
  const { productId } = req.params;
  const { deliveryOptionId } = req.body;
  const item = cart.find((c) => c.productId === productId);
  if (!item) return res.status(404).json({ error: 'Item not in cart' });
  if (deliveryOptionId) item.deliveryOptionId = deliveryOptionId;
  res.json(item);
});

app.delete('/cart/:productId', (req, res) => {
  cart = cart.filter((item) => item.productId !== req.params.productId);
  res.json(cart);
});

// ----------------- ORDERS -----------------

app.post('/orders', (req, res) => {
  const { cart: cartFromBody } = req.body;
  if (!Array.isArray(cartFromBody)) {
    return res.status(400).json({ error: 'cart array is required' });
  }

  let totalCostCents = 0;
  const orderProducts = cartFromBody.map((cartItem) => {
    const product = getProduct(cartItem.productId);
    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);

    const productCostCents = product ? product.priceCents * cartItem.quantity : 0;
    totalCostCents += productCostCents + (deliveryOption ? deliveryOption.priceCents : 0);

    const estimatedDeliveryTimeMs =
      Date.now() + (deliveryOption ? deliveryOption.deliveryDays : 7) * 24 * 60 * 60 * 1000;

    return {
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      estimatedDeliveryTimeMs
    };
  });

  totalCostCents = Math.round(totalCostCents * 1.1); // + 10% tax, matches frontend math

  const order = {
    id: crypto.randomUUID(),
    orderTimeMs: Date.now(),
    totalCostCents,
    products: orderProducts
  };

  const orders = readJSON(ORDERS_FILE);
  orders.unshift(order);
  writeJSON(ORDERS_FILE, orders);

  // Clear the cart after placing an order, like the real tutorial backend
  cart = [];

  res.status(201).json(order);
});

app.get('/orders', (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  res.json(orders);
});

app.get('/orders/:orderId', (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const order = orders.find((o) => o.id === req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// ----------------- HEALTH -----------------

app.get('/', (req, res) => {
  res.redirect('/amazon.html');
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
