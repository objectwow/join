import { JoinData } from "../src/core";
import { JoinError } from "../src/error";
import { JoinDataParam } from "../src/type";

describe("JoinData - execute method full coverage", () => {
  let joinData: JoinData;

  beforeEach(() => {
    joinData = new JoinData();
  });

  it("should handle cases with no matching values", async () => {
    const local = [{ id: 1 }, { id: 2 }];
    const from = () => [{ id: 1, name: "John" }];

    const result = await joinData.execute({
      local,
      localField: "id",
      fromField: "id",
      from,
      as: "userInfo",
      asMap: { userName: "name" },
    });

    expect(local).toEqual([
      { id: 1, userInfo: { userName: "John" } },
      { id: 2 }, // No matching user info
    ]);
    expect(result.allSuccess).toBe(false);
    expect(result.joinFailedValues).toEqual([2]);
  });

  it("should correctly map values based on provided mappings", async () => {
    const local = { id: 1 };

    const result = await joinData.execute({
      local,
      localField: "id",
      fromField: "id",
      from: () => [{ id: 1, details: { contact: { name: "John" } } }],
      as: "userInfo",
      asMap: { name: "details.contact.name" },
    });
    expect(local).toEqual({ id: 1, userInfo: { name: "John" } });
    expect(result.allSuccess).toBe(true);
  });

  it("should handle cases where parameters are undefined or incorrect", async () => {
    const local = { id: 1 };
    const fromFn = () => [{ id: 2, name: "Alice" }]; // No match for local.id

    const result = await joinData.execute({
      local,
      localField: "id",
      fromField: "id",
      from: fromFn,
      as: "userInfo",
      asMap: { name: "name" },
    });

    expect(local).toEqual({ id: 1 }); // No userInfo set
    expect(result.allSuccess).toBe(false);
    expect(result.joinFailedValues).toContain(1);
  });

  it("should merge entire from objects into each local array element when as and asMap are undefined", async () => {
    const param: JoinDataParam = {
      from: async () => {
        const result = [
          { id: 1, name: "Alice", age: 25 },
          { id: 2, name: "Bob", age: 30 },
        ] as unknown as Promise<object[]>;

        return result;
      },
      local: [{ id: 1 }, { id: 2 }],
      localField: "id",
      fromField: "id",
      asMap: undefined,
      as: undefined,
    };

    const result = await joinData.execute(param);

    // Entire from object should be merged into each local array element
    expect(param.local).toEqual([
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 },
    ]);

    expect(result).toEqual({
      joinFailedValues: [],
      allSuccess: true,
    });
  });

  it("should merge entire from objects into each local array element when as are undefined", async () => {
    const fromFn = async () => [
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 },
    ];

    const param: JoinDataParam = {
      from: await fromFn(),
      local: [{ id: 1 }, { id: 2 }],
      localField: "id",
      fromField: "id",
      asMap: {
        personName: "name",
        personAge: "age",
      },
      as: undefined,
    };

    const result = await joinData.execute(param);

    // Entire from object should be merged into each local array element
    expect(param.local).toEqual([
      { id: 1, personName: "Alice", personAge: 25 },
      { id: 2, personName: "Bob", personAge: 30 },
    ]);

    expect(result).toEqual({
      joinFailedValues: [],
      allSuccess: true,
    });
  });

  it("should handle cases where localField array has no matching fromField", async () => {
    const local = [
      { id: 1, items: [101, 102] },
      { id: 2, items: [201] },
    ];

    const from = () => [
      { id: 202, product: "Product 202" }, // No matching IDs for local.items
    ];

    const result = await joinData.execute({
      local,
      localField: "items",
      fromField: "id",
      from,
      as: "products",
      asMap: { productName: "product" },
    });

    expect(local).toEqual([
      {
        id: 1,
        items: [101, 102],
        products: [], // No matches
      },
      {
        id: 2,
        items: [201],
        products: [], // No matches
      },
    ]);
    expect(result.allSuccess).toBe(false);
    expect(result.joinFailedValues).toEqual([101, 102, 201]); // All items failed to find a match
  });

  it("should handle multiple localField arrays with overlapping items", async () => {
    const local = [
      { id: 1, items: [101, 102] },
      { id: 2, items: [101, 201] },
    ];

    const from = () => [
      { id: 101, product: "Product 101" },
      { id: 102, product: "Product 102" },
      { id: 201, product: "Product 201" },
    ];

    const result = await joinData.execute({
      local,
      localField: "items",
      fromField: "id",
      from,
      as: "products",
      asMap: { id: "id", productName: "product" },
    });

    expect(local).toEqual([
      {
        id: 1,
        items: [101, 102],
        products: [
          { id: 101, productName: "Product 101" },
          { id: 102, productName: "Product 102" },
        ],
      },
      {
        id: 2,
        items: [101, 201],
        products: [
          { id: 101, productName: "Product 101" },
          { id: 201, productName: "Product 201" },
        ],
      },
    ]);
    expect(result.allSuccess).toBe(true);
  });

  it("should match a single object and map fields correctly", async () => {
    const local = { id: 1 };
    const from = () => [{ id: 1, name: "John" }];

    const result = await joinData.execute({
      local,
      localField: "id",
      fromField: "id",
      from,
      as: "userInfo",
      asMap: { userName: "name" },
    });

    expect(local).toEqual({ id: 1, userInfo: { userName: "John" } });
    expect(result.allSuccess).toBe(true);
    expect(result.joinFailedValues).toEqual([]);
  });

  it("should match multiple objects with partial matches", async () => {
    const local = [{ id: 1 }, { id: 2 }];
    const from = () => [
      { id: 1, name: "Alice" },
      { id: 3, name: "Bob" },
    ];

    const result = await joinData.execute({
      local,
      localField: "id",
      fromField: "id",
      from,
      as: "userInfo",
      asMap: { userName: "name" },
    });

    expect(local).toEqual([
      { id: 1, userInfo: { userName: "Alice" } },
      { id: 2 },
    ]);
    expect(result.allSuccess).toBe(false);
    expect(result.joinFailedValues).toEqual([2]);
  });

  it("should handle asMap as a function", async () => {
    const local = { id: 1 };
    const from = () => [{ id: 1, firstName: "John", lastName: "Doe" }];
    const asMapFn = (fromValue: any) =>
      `${fromValue.firstName} ${fromValue.lastName}`;

    const result = await joinData.execute({
      local,
      localField: "id",
      fromField: "id",
      from,
      as: "fullName",
      asMap: asMapFn,
    });

    expect(local).toEqual({ id: 1, fullName: "John Doe" });
    expect(result.allSuccess).toBe(true);
  });

  it("should handle asMap as a function", async () => {
    const local = { id: 1 };
    const from = () => [{ id: 1, firstName: "John", lastName: "Doe" }];
    const asMapFn = (fromValue: any) =>
      `${fromValue.firstName} ${fromValue.lastName}`;

    const result = await joinData.execute({
      local,
      localField: "id",
      fromField: "id",
      from,
      as: "fullName",
      asMap: asMapFn,
    });

    expect(local).toEqual({ id: 1, fullName: "John Doe" });
    expect(result.allSuccess).toBe(true);
  });

  it("should throw an error if as is not defined for array fields", async () => {
    const local = { id: 1, items: [1, 2] };
    const from = () => [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ];

    await expect(
      joinData.execute({
        local,
        localField: "items",
        fromField: "id",
        from,
        as: undefined,
        asMap: { itemName: "name" },
      })
    ).rejects.toThrow("Not found as when local value is array");
  });

  it("should handle no matches when from returns an empty array", async () => {
    const local = [{ id: 1 }, { id: 2 }];
    const from = () => [];

    const result = await joinData.execute({
      local,
      localField: "id",
      fromField: "id",
      from,
      as: "userInfo",
      asMap: { userName: "name" },
    });

    expect(local).toEqual([{ id: 1 }, { id: 2 }]);
    expect(result.allSuccess).toBe(false);
    expect(result.joinFailedValues).toEqual([1, 2]);
  });

  it("should map values using asMap object", async () => {
    const local = { id: 1 };
    const from = () => [{ id: 1, details: { name: "Alice", age: 25 } }];

    const result = await joinData.execute({
      local,
      localField: "id",
      fromField: "id",
      from,
      as: "userInfo",
      asMap: { userName: "details.name", userAge: "details.age" },
    });

    expect(local).toEqual({
      id: 1,
      userInfo: { userName: "Alice", userAge: 25 },
    });
    expect(result.allSuccess).toBe(true);
  });

  it("should throw an error when missing parameter", async () => {
    const local = null as any;
    const from = [];

    try {
      await joinData.execute({
        local,
        localField: "id",
        fromField: "id",
        from,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(JoinError);
    }
  });

  it("should throw an error when wrong 'local' parameter format", async () => {
    const local = "string" as any;
    const from = [];

    try {
      await joinData.execute({
        local,
        localField: "id",
        fromField: "id",
        from,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(JoinError);
    }
  });

  it("should throw an error when wrong 'asMap' parameter format", async () => {
    const local = { id: 1 };
    const from = [{ id: 1 }];

    try {
      await joinData.execute({
        local,
        localField: "id",
        fromField: "id",
        from,
        asMap: 123 as any,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(JoinError);
    }
  });

  it("should map values using asMap deep object", async () => {
    const local = { id: 1 };
    const from = () => [{ id: 1, details: { name: "Alice", age: 25 } }];

    const result = await joinData.execute({
      local,
      localField: "id",
      fromField: "id",
      from,
      as: "userInfo.deep",
      asMap: { userName: "details.name", userAge: "details.age" },
    });

    expect(local).toEqual({
      id: 1,
      userInfo: { deep: { userName: "Alice", userAge: 25 } },
    });
    expect(result.allSuccess).toBe(true);
  });

  it("should skip when local value not found", async () => {
    const local = { id: null };
    const from = () => [{ id: 2 }];

    const result = await joinData.execute({
      local,
      localField: "id",
      fromField: "id",
      from,
    });

    expect(local).toEqual({ id: null });
    expect(result.allSuccess).toBe(true);
  });

  it("should throw an error when 'local[as]' is existing with type array and first path of 'localField' and 'as' not matching", async () => {
    const local = { id: 1, products: [], productIds: [1, 2] };
    const from = [{ id: 1, name: "A" }];

    try {
      const result = await joinData.execute({
        local,
        localField: "productIds",
        fromField: "id",
        from,
        as: "products",
      });
      console.log(result);
    } catch (error) {
      expect(error).toBeInstanceOf(JoinError);
    }
  });

  it("should throw an error when 'local[as]' is existing with type array and first path of 'localField' and 'as' not matching", async () => {
    const local = { id: 1, products: [], productIds: [1, 2] };
    const from = [{ id: 1, name: "A" }];

    try {
      const result = await joinData.execute({
        local,
        localField: "productIds",
        fromField: "id",
        from,
        as: "products",
      });
      console.log(result);
    } catch (error) {
      expect(error).toBeInstanceOf(JoinError);
    }
  });

  it("should throw an error when 'as' and 'localField' is same", async () => {
    const local = {};
    const from = [];

    try {
      const result = await joinData.execute({
        local,
        localField: "productIds",
        fromField: "id",
        from,
        as: "productIds",
      });
      console.log(result);
    } catch (error) {
      expect(error).toBeInstanceOf(JoinError);
    }
  });

  it("should throw an error when 'local[as]' is existing with type object, but local value is array", async () => {
    const local = { id: 1, product: {}, productIds: [1, 2] };
    const from = [{ id: 1, name: "A" }];

    try {
      const result = await joinData.execute({
        local,
        localField: "productIds",
        fromField: "id",
        from,
        as: "product",
      });
      console.log(result);
    } catch (error) {
      expect(error).toBeInstanceOf(JoinError);
    }
  });

  it("should throw an error when 'local[as]' is existing with type array, but local value is not array", async () => {
    const local = { id: 1, products: [], productId: "1" };
    const from = [{ id: 1, name: "A" }];

    try {
      const result = await joinData.execute({
        local,
        localField: "productId",
        fromField: "id",
        from,
        as: "products",
      });
      console.log(result);
    } catch (error) {
      expect(error).toBeInstanceOf(JoinError);
    }
  });

  it("should throw an error when from not be an array", async () => {
    const local = { id: 1, products: [], productId: "1" };
    const from = { id: 1, name: "A" } as any;

    try {
      const result = await joinData.execute({
        local,
        localField: "productId",
        fromField: "id",
        from,
        as: "products",
      });
      console.log(result);
    } catch (error) {
      expect(error).toBeInstanceOf(JoinError);
    }
  });

  it("should skip when local is empty", async () => {
    const local = {};
    const from = () => [{ id: 2 }];

    const result = await joinData.execute({
      local,
      localField: "id",
      fromField: "id",
      from,
    });

    expect(local).toEqual({});
    expect(result.allSuccess).toBe(true);
  });

  it("should map with asMap function", async () => {
    const local = { id: 1, customerId: 11 };
    const from = [{ id: 11, firstName: "John", lastName: "Doe" }];

    const result = await joinData.execute({
      local,
      localField: "customerId",
      fromField: "id",
      from,
      as: "customerName",
      asMap: (currentFrom: any, currentLocal: any) => {
        return `${currentFrom.firstName} ${currentFrom.lastName}`;
      },
    });

    expect(local).toEqual({
      id: 1,
      customerName: "John Doe",
      customerId: 11,
    });
    expect(result.allSuccess).toBe(true);
  });
});
