import { joinData } from "../index"; // Assuming you have your JoinData class in src/core

describe("JoinData - Sample test case for joining customer details into orders", () => {
  it("should join customer details into the orders", async () => {
    const orders = [
      {
        id: 1,
        customer: {
          id: 1,
          name: "Alice",
        },
      },
    ];

    const customers = [
      {
        id: 1,
        name: "Alice",
        address: "123 Main St",
        email: "alice@example.com",
        phone: "123-456-7890",
      },
      {
        id: 2,
        name: "Bob",
        address: "456 Elm St",
        email: "bob@example.com",
        phone: "987-654-3210",
      },
    ];

    const result = await joinData({
      local: orders,
      from: () => customers,
      localField: "customer.id",
      fromField: "id",
      as: "customer",
      asMap: {
        id: "id",
        name: "name",
        address: "address",
        email: "email",
        phone: "phone",
      },
    });

    const ordersExpected = [
      {
        id: 1,
        customer: {
          id: 1,
          name: "Alice",
          address: "123 Main St",
          email: "alice@example.com",
          phone: "123-456-7890",
        },
      },
    ];

    expect(orders).toEqual(ordersExpected);
    expect(result.allSuccess).toBe(true);
    expect(result.joinFailedValues).toEqual([]);
  });

  it("should join customer details into the orders without asMap", async () => {
    const orders = [
      {
        id: 1,
        customer: {
          id: 1,
          code: "1",
        },
      },
    ];

    const customers = [
      {
        id: 1,
        name: "Alice",
        address: "123 Main St",
        email: "alice@example.com",
        phone: "123-456-7890",
      },
      {
        id: 2,
        name: "Bob",
        address: "456 Elm St",
        email: "bob@example.com",
        phone: "987-654-3210",
      },
    ];

    const result = await joinData({
      local: orders,
      from: () => customers,
      localField: "customer.id",
      fromField: "id",
      as: "customer",
    });

    const ordersExpected = [
      {
        id: 1,
        customer: {
          id: 1,
          code: "1",
          name: "Alice",
          address: "123 Main St",
          email: "alice@example.com",
          phone: "123-456-7890",
        },
      },
    ];

    expect(orders).toEqual(ordersExpected);
    expect(result.allSuccess).toBe(true);
    expect(result.joinFailedValues).toEqual([]);
  });
});
