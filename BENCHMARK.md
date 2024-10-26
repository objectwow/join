# Benchmark

- Source:

```typescript
// Generate localData with 100 orders and 2 fulfillments per order
const localData = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1, // Order ID starting from 1
  code: `${i + 1}`, // Order code
  fulfillments: Array.from({ length: 2 }, (_, j) => ({
    id: (i + 1) * 10 + j, // Fulfillment ID for each order
    code: `${(i + 1) * 10 + j}`, // Fulfillment code
    products: Array.from({ length: 2 }, () => {
      const productId = Math.floor(Math.random() * 100) + 111; // Random product ID between 111 and 210
      return {
        id: productId,
        quantity: Math.floor(Math.random() * 10) + 1, // Random quantity between 1 and 10
      };
    }),
  })),
}));

// Generate fromData with 100 products
const fromData = Array.from({ length: 100 }, (_, i) => ({
  id: i + 111, // IDs starting from 111
  name: `Product ${i + 1}`,
  price: Math.floor(Math.random() * 100 + 1), // Random price between 1 and 100
}));
```

- Execute: `node lib/benchmark.js` (need build first)
- Report: JoinData Execution x 125,972 ops/sec ±1.27% (66 runs sampled)
- Device: Macbook Pro M1 Pro, 16 GB RAM, 12 CPU
