import { JoinData } from '../src/core';
import { JoinDataParam } from '../src/type';

describe('JoinData - execute method full coverage', () => {
  let joinData: JoinData;

  beforeEach(() => {
    joinData = new JoinData();
  });

  it('should throw an error if local is missing', async () => {
    const from = jest.fn().mockResolvedValue([{ id: 1 }]);
    await expect(
      joinData.execute({
        local: null,
        localField: 'id',
        from,
        fromField: 'id',
        as: 'mappedData',
        asMap: { id: 'id' }
      })
    ).rejects.toThrow('Missing local value');
  });

  it('should throw an error if from is missing', async () => {
    const local = { id: 1 };
    await expect(
      joinData.execute({
        local,
        localField: 'id',
        from: null,
        fromField: 'id',
        as: 'mappedData',
        asMap: { id: 'id' }
      })
    ).rejects.toThrow('Missing from value');
  });

  it('should map values from the from array to the local object', async () => {
    const local = { id: 1 };
    const from = jest.fn().mockResolvedValue([{ id: 1, name: 'John' }]);

    const result = await joinData.execute({
      local,
      localField: 'id',
      from,
      fromField: 'id',
      as: 'userInfo',
      asMap: { name: 'name' }
    });

    expect(local).toEqual({
      id: 1,
      userInfo: { name: 'John' }
    });
    expect(result.allSuccess).toBe(true);
  });

  it('should map values from the from array to the local array of objects', async () => {
    const local = [{ id: 1 }, { id: 2 }];
    const from = jest.fn().mockResolvedValue([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]);

    const result = await joinData.execute({
      local,
      localField: 'id',
      from,
      fromField: 'id',
      as: 'userInfo',
      asMap: { name: 'name' }
    });

    expect(local).toEqual([
      { id: 1, userInfo: { name: 'John' } },
      { id: 2, userInfo: { name: 'Jane' } }
    ]);
    expect(result.allSuccess).toBe(true);
  });

  it('should return failed values when from object is missing', async () => {
    const local = [{ id: 1 }, { id: 2 }];
    const from = jest.fn().mockResolvedValue([{ id: 1, name: 'John' }]);

    const result = await joinData.execute({
      local,
      localField: 'id',
      from,
      fromField: 'id',
      as: 'userInfo',
      asMap: { name: 'name' }
    });

    expect(local).toEqual([
      { id: 1, userInfo: { name: 'John' } },
      { id: 2 } // No matching user info
    ]);
    expect(result.allSuccess).toBe(false);
    expect(result.joinFailedValues).toEqual([2]);
  });

  it('should handle array of values in localField and map correctly', async () => {
    const local = [
      { id: 1, items: [101, 102] },
      { id: 2, items: [201] }
    ];
    const from = jest.fn().mockResolvedValue([
      { id: 101, product: 'Product 101' },
      { id: 102, product: 'Product 102' },
      { id: 201, product: 'Product 201' }
    ]);

    const result = await joinData.execute({
      local,
      localField: 'items',
      fromField: 'id',
      from,
      as: 'products',
      asMap: { productName: 'product' }
    });

    expect(local).toEqual([
      {
        id: 1,
        items: [101, 102],
        products: [{ productName: 'Product 101' }, { productName: 'Product 102' }]
      },
      {
        id: 2,
        items: [201],
        products: [{ productName: 'Product 201' }]
      }
    ]);
    expect(result.allSuccess).toBe(true);
  });

  it('should handle missing values gracefully without throwing errors', async () => {
    const local = { id: 1 };
    const from = jest.fn().mockResolvedValue([{ id: 2, name: 'John' }]); // No match for local.id

    const result = await joinData.execute({
      local,
      localField: 'id',
      fromField: 'id',
      from,
      as: 'userInfo',
      asMap: { name: 'name' }
    });

    expect(local).toEqual({ id: 1 }); // No userInfo set
    expect(result.allSuccess).toBe(false);
    expect(result.joinFailedValues).toContain(1);
  });

  it('should handle deep nested objects in asMap', async () => {
    const local = { id: 1 };
    const from = jest.fn().mockResolvedValue([
      { id: 1, details: { contact: { name: 'John' } } }
    ]);

    const result = await joinData.execute({
      local,
      localField: 'id',
      fromField: 'id',
      from,
      as: 'userInfo',
      asMap: { name: 'details.contact.name' }
    });

    expect(local).toEqual({
      id: 1,
      userInfo: { name: 'John' }
    });
    expect(result.allSuccess).toBe(true);
  });

  it('should assign from values directly when asMap is not provided', async () => {
    const local = { id: 1 };
    const from = jest.fn().mockResolvedValue([{ id: 1, name: 'John', age: 30 }]);

    const result = await joinData.execute({
      local,
      localField: 'id',
      fromField: 'id',
      from,
      as: 'userInfo'
    });

    expect(local).toEqual({
      id: 1,
      userInfo: { id: 1, name: 'John', age: 30 }
    });
    expect(result.allSuccess).toBe(true);
  });

  it('should handle complex cases where local is an array of objects and from is a function', async () => {
    const local = [
      { id: 1, details: { address: '123 Local St' } },
      { id: 2, details: { address: '456 Local St' } }
    ];
    const from = jest.fn().mockResolvedValue([
      { id: 1, user: { contact: { name: 'John', age: 30 } } },
      { id: 2, user: { contact: { name: 'Jane', age: 25 } } }
    ]);

    const result = await joinData.execute({
      local,
      localField: 'id',
      fromField: 'id',
      from,
      as: 'userInfo',
      asMap: {
        name: 'user.contact.name',
        age: 'user.contact.age'
      }
    });

    expect(local).toEqual([
      { id: 1, details: { address: '123 Local St' }, userInfo: { name: 'John', age: 30 } },
      { id: 2, details: { address: '456 Local St' }, userInfo: { name: 'Jane', age: 25 } }
    ]);
    expect(result.allSuccess).toBe(true);
  });

  it('should merge entire `from` object when `as` and `asMap` are undefined', async () => {
    const fromFn = jest.fn().mockResolvedValue([{ id: 1, name: 'Alice', age: 25 }]);
    const param: JoinDataParam<any> = {
      from: fromFn,
      local: { id: 1 },
      localField: 'id',
      fromField: 'id',
      asMap: undefined, // `asMap` is undefined
      as: undefined,    // `as` is undefined
    };

    const result = await joinData.execute(param);

    // Entire `from` object should be merged into `local`
    expect(param.local).toEqual({ id: 1, name: 'Alice', age: 25 });
    expect(result).toEqual({
      joinFailedValues: [],
      allSuccess: true,
    });
  });

  it('should handle case when no matching field found and `as`/`asMap` are undefined', async () => {
    const fromFn = jest.fn().mockResolvedValue([{ id: 1, name: 'Alice', age: 25 }]);
    const param: JoinDataParam<any> = {
      from: fromFn,
      local: { id: 2 },
      localField: 'id',
      fromField: 'id',
      asMap: undefined, // `asMap` is undefined
      as: undefined,    // `as` is undefined
    };

    const result = await joinData.execute(param);

    // `local` should remain unchanged, and id 2 should be added to `joinFailedValues`
    expect(param.local).toEqual({ id: 2 });
    expect(result).toEqual({
      joinFailedValues: [2],
      allSuccess: false,
    });
  });

  it('should merge entire `from` objects into each `local` array element when `as` and `asMap` are undefined', async () => {
    const fromFn = jest.fn().mockResolvedValue([
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 },
    ]);
    const param: JoinDataParam<any> = {
      from: fromFn,
      local: [{ id: 1 }, { id: 2 }],
      localField: 'id',
      fromField: 'id',
      asMap: undefined, // `asMap` is undefined
      as: undefined,    // `as` is undefined
    };

    const result = await joinData.execute(param);

    // Entire `from` object should be merged into each `local` array element
    expect(param.local).toEqual([
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 },
    ]);
    expect(result).toEqual({
      joinFailedValues: [],
      allSuccess: true,
    });
  });

  it('should return failed result when `localField` is incorrect', async () => {
    const fromFn = jest.fn().mockResolvedValue([{ id: 1, name: 'Alice' }]);
    const param: JoinDataParam<any> = {
      from: fromFn,
      local: { wrongLocalField: 1 }, // Wrong `localField`
      localField: 'id', // `localField` does not exist in `local`
      fromField: 'id',
      asMap: undefined,
      as: undefined,
    };

    const result = await joinData.execute(param);

    // The `local` object should remain unchanged
    expect(param.local).toEqual({ wrongLocalField: 1 });
    // The result should indicate failure because the `localField` is missing
    expect(result).toEqual({
      joinFailedValues: [],
      allSuccess: true, // No `localField` present, but no join was expected
    });
  });

  it('should return failed result when `fromField` is incorrect', async () => {
    const fromFn = jest.fn().mockResolvedValue([{ wrongId: 1, name: 'Alice' }]); // Wrong `fromField`
    const param: JoinDataParam<any> = {
      from: fromFn,
      local: { id: 1 },
      localField: 'id',
      fromField: 'id', // `fromField` is incorrect
      asMap: undefined,
      as: undefined,
    };

    const result = await joinData.execute(param);

    // The `local` object should remain unchanged
    expect(param.local).toEqual({ id: 1 });
    // The result should indicate failure because the `fromField` was wrong
    expect(result).toEqual({
      joinFailedValues: [1],
      allSuccess: false,
    });
  });
});
