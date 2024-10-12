import { joinData } from "../index"; // Assuming you have your JoinData class in src/core

describe("JoinData - Sample test case for joining orders with products", () => {
  let orders: any[];
  let products: any[];

  beforeEach(() => {
    orders = JSON.parse(
      JSON.stringify([
        {
          id: 1,
          code: "1",
          fulfillments: [
            {
              id: 11,
              code: "11",
              products: [
                {
                  id: 111,
                  quantity: 1,
                },
                {
                  id: 112,
                  quantity: 4,
                },
              ],
            },
            {
              id: 12,
              code: "12",
              products: [
                {
                  id: 111,
                  quantity: 8,
                },
              ],
            },
          ],
        },
        {
          id: 2,
          code: "2",
          fulfillments: [
            {
              id: 21,
              code: "21",
              products: [
                {
                  id: 111,
                  quantity: 9,
                },
                {
                  id: 112,
                  quantity: 7,
                },
              ],
            },
            {
              id: 22,
              code: "22",
              products: [
                {
                  id: 111,
                  quantity: 2,
                },
                {
                  id: 112,
                  quantity: 3,
                },
              ],
            },
          ],
        },
      ])
    );

    products = JSON.parse(
      JSON.stringify([
        {
          id: 111,
          name: "Product 1",
          price: 10,
        },
        {
          id: 112,
          name: "Product 2",
          price: 20,
        },
        {
          id: 113,
          name: "Product 3",
          price: 30,
        },
      ])
    );
  });

  it("should join product details into the orders", async () => {
    const result = await joinData({
      local: orders,
      from: () => products,
      localField: "fulfillments.products.id",
      fromField: "id",
      as: "fulfillments.products",
      asMap: {
        id: "id",
        name: "name",
        price: "price",
      },
    });

    const expectedOrders = [
      {
        id: 1,
        code: "1",
        fulfillments: [
          {
            id: 11,
            code: "11",
            products: [
              { id: 111, name: "Product 1", price: 10, quantity: 1 },
              { id: 112, name: "Product 2", price: 20, quantity: 4 },
            ],
          },
          {
            id: 12,
            code: "12",
            products: [{ id: 111, name: "Product 1", price: 10, quantity: 8 }],
          },
        ],
      },
      {
        id: 2,
        code: "2",
        fulfillments: [
          {
            id: 21,
            code: "21",
            products: [
              { id: 111, name: "Product 1", price: 10, quantity: 9 },
              { id: 112, name: "Product 2", price: 20, quantity: 7 },
            ],
          },
          {
            id: 22,
            code: "22",
            products: [
              { id: 111, name: "Product 1", price: 10, quantity: 2 },
              { id: 112, name: "Product 2", price: 20, quantity: 3 },
            ],
          },
        ],
      },
    ];

    expect(orders).toEqual(expectedOrders);
    expect(result.allSuccess).toBe(true);
  });

  it("should list all products into the orders", async () => {
    const result = await joinData({
      local: orders,
      from: () => products,
      localField: "fulfillments.products.id",
      fromField: "id",
      as: "products",
    });

    const expectedOrders = [
      {
        id: 1,
        code: "1",
        fulfillments: [
          {
            id: 11,
            code: "11",
            products: [
              {
                id: 111,
                quantity: 1,
              },
              {
                id: 112,
                quantity: 4,
              },
            ],
          },
          {
            id: 12,
            code: "12",
            products: [
              {
                id: 111,
                quantity: 8,
              },
            ],
          },
        ],
        products: [
          {
            id: 111,
            name: "Product 1",
            price: 10,
          },
          {
            id: 112,
            name: "Product 2",
            price: 20,
          },
        ],
      },
      {
        id: 2,
        code: "2",
        fulfillments: [
          {
            id: 21,
            code: "21",
            products: [
              {
                id: 111,
                quantity: 9,
              },
              {
                id: 112,
                quantity: 7,
              },
            ],
          },
          {
            id: 22,
            code: "22",
            products: [
              {
                id: 111,
                quantity: 2,
              },
              {
                id: 112,
                quantity: 3,
              },
            ],
          },
        ],
        products: [
          {
            id: 111,
            name: "Product 1",
            price: 10,
          },
          {
            id: 112,
            name: "Product 2",
            price: 20,
          },
        ],
      },
    ];

    expect(orders).toEqual(expectedOrders);
    expect(result.allSuccess).toBe(true);
  });

  it("should list all productIds into the orders", async () => {
    const result = await joinData({
      local: orders,
      from: () => products,
      localField: "fulfillments.products.id",
      fromField: "id",
      as: "products",
      asMap: "id",
    });

    const expectedOrders = [
      {
        id: 1,
        code: "1",
        fulfillments: [
          {
            id: 11,
            code: "11",
            products: [
              {
                id: 111,
                quantity: 1,
              },
              {
                id: 112,
                quantity: 4,
              },
            ],
          },
          {
            id: 12,
            code: "12",
            products: [
              {
                id: 111,
                quantity: 8,
              },
            ],
          },
        ],
        products: [111, 112],
      },
      {
        id: 2,
        code: "2",
        fulfillments: [
          {
            id: 21,
            code: "21",
            products: [
              {
                id: 111,
                quantity: 9,
              },
              {
                id: 112,
                quantity: 7,
              },
            ],
          },
          {
            id: 22,
            code: "22",
            products: [
              {
                id: 111,
                quantity: 2,
              },
              {
                id: 112,
                quantity: 3,
              },
            ],
          },
        ],
        products: [111, 112],
      },
    ];

    expect(orders).toEqual(expectedOrders);
    expect(result.allSuccess).toBe(true);
  });

  it("should join product details into the orders + custom value", async () => {
    const result = await joinData({
      local: orders,
      from: () => products,
      localField: "fulfillments.products.id",
      fromField: "id",
      as: "fulfillments.products",
      asMap: async (currentFrom: any, currentLocal: any) => {
        return {
          id: currentFrom.id,
          name: currentFrom.name,
          price: currentFrom.price,
          customValue: `customValue ${currentFrom.id}`,
        };
      },
    });

    const expectedOrders = [
      {
        id: 1,
        code: "1",
        fulfillments: [
          {
            id: 11,
            code: "11",
            products: [
              {
                id: 111,
                name: "Product 1",
                price: 10,
                quantity: 1,
                customValue: "customValue 111",
              },
              {
                id: 112,
                name: "Product 2",
                price: 20,
                quantity: 4,
                customValue: "customValue 112",
              },
            ],
          },
          {
            id: 12,
            code: "12",
            products: [
              {
                id: 111,
                name: "Product 1",
                price: 10,
                quantity: 8,
                customValue: "customValue 111",
              },
            ],
          },
        ],
      },
      {
        id: 2,
        code: "2",
        fulfillments: [
          {
            id: 21,
            code: "21",
            products: [
              {
                id: 111,
                name: "Product 1",
                price: 10,
                quantity: 9,
                customValue: "customValue 111",
              },
              {
                id: 112,
                name: "Product 2",
                price: 20,
                quantity: 7,
                customValue: "customValue 112",
              },
            ],
          },
          {
            id: 22,
            code: "22",
            products: [
              {
                id: 111,
                name: "Product 1",
                price: 10,
                quantity: 2,
                customValue: "customValue 111",
              },
              {
                id: 112,
                name: "Product 2",
                price: 20,
                quantity: 3,
                customValue: "customValue 112",
              },
            ],
          },
        ],
      },
    ];

    expect(orders).toEqual(expectedOrders);
    expect(result.allSuccess).toBe(true);
  });
});
