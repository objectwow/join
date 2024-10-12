// benchmark.ts

import { Benchmark } from "benchmark";
import { joinData } from "./index"; // Import your core function/module

const suite = new Benchmark.Suite();

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

// Add your benchmarks
suite
  .add("JoinData Execution", () => {
    // Call the method you want to benchmark
    joinData({
      local: JSON.parse(JSON.stringify(localData)),
      from: fromData,
      localField: "fulfillments.products.id",
      fromField: "id",
      as: "fulfillments.products",
      asMap: {
        id: "id",
        name: "name",
        price: "price",
      },
    });
  })
  .on("cycle", (event: any) => {
    console.log(String(event.target));
  })
  .on("complete", function () {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .run({ async: true });
