# @objectwow/join

Perform a deep join of arrays of objects using UIDs.

⭐️ Your star shines on us. Star us on [GitHub](https://github.com/objectwow/join)!

# Use case

When you aggregate data, such as orders and products, you might have something like the following example:

```typescript
const orders = [
  {
    id: 1,
    code: "1",
    fulfillments: [
      {
        id: 12,
        code: "12",
        products: [{ id: 111, quantity: 8 }],
      },
      {
        id: 13,
        code: "13",
        products: [{ id: 112, quantity: 10 }],
      },
    ],
  },
];

const products = [
  { id: 111, name: "Product 1", price: 10 },
  { id: 112, name: "Product 2", price: 20 },
];
```

- Add `name`, `price` to `fulfillments.products`

```typescript
orders = [
  {
    id: 1,
    code: "1",
    fulfillments: [
      {
        id: 12,
        code: "12",
        products: [{ id: 111, name: "Product 1", price: 10, quantity: 8 }],
      },
      // another data
    ],
  },
];
```

- Add `product` to `fulfillments.products`

```typescript
orders = [
  {
    id: 1,
    code: "1",
    fulfillments: [
      {
        id: 12,
        code: "12",
        products: [
          {
            id: 111,
            quantity: 8,
            product: {
              id: 111,
              name: "Product 1",
              price: 10,
            },
          },
        ],
      },
      // another data
    ],
  },
];
```

- Add `productNames` to root

```typescript
orders = [
  {
    id: 1,
    code: "1",
    productNames: ["Product 1", "Product 2"],
    // another data
  },
];
```

- Add `productNameWithPrices` to root

```typescript
orders = [
  {
    id: 1,
    code: "1",
    productNameWithPrices: ["Product 1 10", "Product 2 20"],
    // another data
  },
];
```

We need a library to simplify this process.

# Installation

```
npm i @objectwow/join
```

# Usage

```typescript
import { joinData } from "@objectwow/join";

const result = await joinData({
  local: orders,
  from: products,
  localField: "fulfillments.products.id",
  fromField: "id",
  as: "fulfillments.products",
});
```

LocalData (orders) will be overwritten. Order products will have the `name` and `price` fields.

```typescript
orders = [
  {
    id: 1,
    code: "1",
    fulfillments: [
      {
        id: 12,
        code: "12",
        products: [{ id: 111, name: "Product 1", price: 10, quantity: 8 }],
      },
      {
        id: 13,
        code: "13",
        products: [{ id: 112, name: "Product 2", price: 20, quantity: 10 }],
      },
    ],
  },
];

result = {
  allSuccess: true,
  joinFailedValues: [],
};
```

Note: see more samples in the [`tests`](https://github.com/objectwow/join/blob/main/tests/core.spec.ts) and [`test-by-cases`](https://github.com/objectwow/join/blob/main/test-by-cases)

```typescript
/**
 * Parameters for the `joinData` function to perform joins between local data and source data.
 */
export interface JoinDataParam {
  /**
   * Local object or array of local objects to be joined.
   */
  local: LocalParam;

  /**
   * Objects or an asynchronous callback function that returns the data from the source.
   */
  from: FromParam;

  /**
   * Field name in the local object(s) used for the join.
   */
  localField: string;

  /**
   * Field name in the `from` object(s) used for the join.
   */
  fromField: string;

  /**
   * Optional new field name to store the result of the join in the local object(s).
   */
  as?: string;

  /**
   * Optional mapping from the `fromField` values to new field names in the local object(s).
   */
  asMap?: AsMap;
}

export type LocalParam = object | object[];

export type FromParam =
  | ((localFieldValues: Primitive[], metadata: any) => object[])
  | object[];

export type AsMap =
  | ((currentFrom: any, currentLocal: any, metadata: any) => any)
  | { [key: string]: string }
  | string;
```

# Internal resources

- [Comparison](COMPARISON.md)
- [Testing](TESTING.md)
- [Benchmark](BENCHMARK.md)
- [Customization](CUSTOMIZATION.md)
- [Question](QUESTION.md)

# Contact

If you have any questions, feel free to open an [`open an issue on GitHub`](https://github.com/objectwow/join/issues) or connect with me on [`Linkedin`](https://www.linkedin.com/in/vtuanjs/).

Thank you for using and supporting the project!

# Contributors

<a href="https://github.com/objectwow/join/graphs/contributors"><img src="https://opencollective.com/objectwow-join/contributors.svg?width=882&button=false" /></a>
