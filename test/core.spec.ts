import { JoinData } from "../src/core";
import { JoinDataParam } from "../src/type";

describe("JoinData - execute method full coverage", () => {
  let joinData: JoinData;

  beforeEach(() => {
    joinData = new JoinData();
  });

  it("should throw an error if required parameters are missing", async () => {
    await expect(
      joinData.execute({
        local: null,
        localField: "id",
        from: jest.fn(),
        fromField: "id",
      })
    ).rejects.toThrow("Missing local value");

    await expect(
      joinData.execute({
        local: { id: 1 },
        localField: "id",
        from: null,
        fromField: "id",
      })
    ).rejects.toThrow("Missing from value");
  });

  it("should correctly map values based on provided mappings", async () => {
    const testCases = [
      {
        description: "single local object",
        local: { id: 1 },
        from: jest.fn().mockResolvedValue([{ id: 1, name: "John" }]),
        expected: { id: 1, userInfo: { name: "John" } },
        asMap: { name: "name" },
      },
      {
        description: "array of local objects",
        local: [{ id: 1 }, { id: 2 }],
        from: jest.fn().mockResolvedValue([
          { id: 1, name: "John" },
          { id: 2, name: "Jane" },
        ]),
        expected: [
          { id: 1, userInfo: { name: "John" } },
          { id: 2, userInfo: { name: "Jane" } },
        ],
        asMap: { name: "name" },
      },
      {
        description: "deep nested objects in asMap",
        local: { id: 1 },
        from: jest
          .fn()
          .mockResolvedValue([
            { id: 1, details: { contact: { name: "John" } } },
          ]),
        expected: { id: 1, userInfo: { name: "John" } },
        asMap: { name: "details.contact.name" },
      },
    ];

    for (const { description, local, from, expected, asMap } of testCases) {
      const result = await joinData.execute({
        local,
        localField: "id",
        fromField: "id",
        from,
        as: "userInfo",
        asMap,
      });
      expect(local).toEqual(expected);
      expect(result.allSuccess).toBe(true);
    }
  });

  it("should handle cases with no matching values", async () => {
    const local = [{ id: 1 }, { id: 2 }];
    const from = jest.fn().mockResolvedValue([{ id: 1, name: "John" }]);

    const result = await joinData.execute({
      local,
      localField: "id",
      fromField: "id",
      from,
      as: "userInfo",
      asMap: { name: "name" },
    });

    expect(local).toEqual([
      { id: 1, userInfo: { name: "John" } },
      { id: 2 }, // No matching user info
    ]);
    expect(result.allSuccess).toBe(false);
    expect(result.joinFailedValues).toEqual([2]);
  });

  it("should handle cases where parameters are undefined or incorrect", async () => {
    const local = { id: 1 };
    const fromFn = jest.fn().mockResolvedValue([{ id: 2, name: "Alice" }]); // No match for local.id

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

  it("should return failed result when localField or fromField is incorrect", async () => {
    const testCases = [
      {
        description: "localField is incorrect",
        local: { wrongLocalField: 1 },
        from: jest.fn().mockResolvedValue([{ id: 1, name: "Alice" }]),
        expectedLocal: { wrongLocalField: 1 },
        localField: "id", // `localField` does not exist in `local`
        fromField: "id",
        expectedResult: {
          joinFailedValues: [],
          allSuccess: true, // No join was expected
        },
      },
      {
        description: "fromField is incorrect",
        local: { id: 1 },
        from: jest.fn().mockResolvedValue([{ wrongId: 1, name: "Alice" }]), // Wrong `fromField`
        expectedLocal: { id: 1 },
        localField: "id",
        fromField: "id",
        expectedResult: {
          joinFailedValues: [1], // Should indicate failure since there are no matching values
          allSuccess: false,
        },
      },
    ];

    for (const {
      description,
      local,
      from,
      expectedLocal,
      localField,
      fromField,
      expectedResult,
    } of testCases) {
      const result = await joinData.execute({
        local,
        localField,
        fromField,
        from,
        asMap: undefined,
        as: undefined,
      });

      expect(local).toEqual(expectedLocal);
      expect(result).toEqual(expectedResult);
    }
  });

  it("should merge entire from objects into each local array element when as and asMap are undefined", async () => {
    const fromFn = jest.fn().mockResolvedValue([
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 },
    ]);

    const param: JoinDataParam = {
      from: fromFn,
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

  it("should map values correctly when localField is an array", async () => {
    const local = [
      { id: 1, items: [101, 102] },
      { id: 2, items: [201] },
    ];
    const from = jest.fn().mockResolvedValue([
      { id: 101, product: "Product 101" },
      { id: 102, product: "Product 102" },
      { id: 201, product: "Product 201" },
    ]);

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
        products: [
          { productName: "Product 101" },
          { productName: "Product 102" },
        ],
      },
      {
        id: 2,
        items: [201],
        products: [{ productName: "Product 201" }],
      },
    ]);
    expect(result.allSuccess).toBe(true);
  });

  it("should handle cases where localField array has no matching fromField", async () => {
    const local = [
      { id: 1, items: [101, 102] },
      { id: 2, items: [201] },
    ];
    const from = jest.fn().mockResolvedValue([
      { id: 202, product: "Product 202" }, // No matching IDs for local.items
    ]);

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
    const from = jest.fn().mockResolvedValue([
      { id: 101, product: "Product 101" },
      { id: 102, product: "Product 102" },
      { id: 201, product: "Product 201" },
    ]);

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
        products: [
          { productName: "Product 101" },
          { productName: "Product 102" },
        ],
      },
      {
        id: 2,
        items: [101, 201],
        products: [
          { productName: "Product 101" },
          { productName: "Product 201" },
        ],
      },
    ]);
    expect(result.allSuccess).toBe(true);
  });
});
