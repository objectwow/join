import { joinData } from "../index"; // Assuming you have your JoinData class in src/core

describe("JoinData - Sample test case for joining orders with products", () => {
  it("should join product information into the order fulfillments", async () => {
    const orders = [
      {
        id: 1,
        fulfillments: [
          {
            id: 11,
            productId: 1,
            quantity: 1,
          },
          {
            id: 12,
            productId: 2,
            quantity: 2,
          },
        ],
      },
      {
        id: 2,
        fulfillments: [
          {
            id: 21,
            productId: 1,
            quantity: 4,
          },
          {
            id: 22,
            productId: 2,
            quantity: 5,
          },
        ],
      },
    ];

    const products = [
      {
        id: 1,
        name: "Product 1",
        price: 10,
      },
      {
        id: 2,
        name: "Product 2",
        price: 20,
      },
    ];

    const result = await joinData({
      local: orders,
      from: () => products,
      localField: "fulfillments.productId",
      fromField: "id",
      as: "fulfillments",
      asMap: {
        productId: "productId",
        name: "name",
        price: "price",
        quantity: "quantity", // From local (quantity is from the fulfillments object)
      },
    });

    expect(orders).toEqual([
      {
        id: 1,
        fulfillments: [
          {
            id: 11,
            productId: 1,
            name: "Product 1",
            price: 10,
            quantity: 1,
          },
          {
            id: 12,
            productId: 2,
            name: "Product 2",
            price: 20,
            quantity: 2,
          },
        ],
      },
      {
        id: 2,
        fulfillments: [
          {
            id: 21,
            productId: 1,
            name: "Product 1",
            price: 10,
            quantity: 4,
          },
          {
            id: 22,
            productId: 2,
            name: "Product 2",
            price: 20,
            quantity: 5,
          },
        ],
      },
    ]);

    expect(result.allSuccess).toBe(true);
    expect(result.joinFailedValues).toEqual([]);
  });
});
