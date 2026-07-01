# Amazon Clone Backend

A Node.js + Express backend that replaces `https://supersimplebackend.dev` for your
Amazon clone project.

## Setup

```bash
npm install
npm start
```

The server runs at `http://localhost:3000`.

## Endpoints

- `GET  /products` — all products
- `GET  /products/:productId` — single product
- `GET  /cart` — current cart
- `POST /cart` — add to cart, body: `{ "productId": "...", "quantity": 1 }`
- `PUT  /cart/:productId` — update delivery option, body: `{ "deliveryOptionId": "2" }`
- `DELETE /cart/:productId` — remove item from cart
- `POST /orders` — place order, body: `{ "cart": [...] }`
- `GET  /orders` — list all past orders
- `GET  /orders/:orderId` — single order

## Connecting your frontend

In your frontend JS files (`products.js`, `cart.js`, `paymentSummary.js`), replace every
occurrence of:

```
https://supersimplebackend.dev
```

with:

```
http://localhost:3000
```

If you open your `amazon.html` directly as a file (not through a local server), the
browser will block the `fetch`/`XMLHttpRequest` calls due to CORS/file:// restrictions.
Serve your frontend with something like `npx serve` or VSCode's "Live Server" extension
instead.

## Notes

- The `data/products.json` file is a starter catalog. The two products in it (socks and
  basketball) intentionally use the same IDs your `cart.js` defaults to, so your existing
  localStorage cart data will resolve correctly. Add/edit products there freely — just
  make sure each `image` path matches an actual file in your frontend's `images/products/`
  folder.
- `cart` is stored in-memory on the server (resets on restart). Swap in a real database
  (e.g. lowdb, SQLite, MongoDB) later if you want persistence beyond `orders.json`.
- Orders are persisted to `data/orders.json` so they survive restarts.
