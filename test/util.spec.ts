import { Types, typeOf, isNullOrUndefined, isEmptyObject } from "../src/util";

describe("Util Functions", () => {
  // Tests for typeOf function
  describe("typeOf function", () => {
    it('should return "Object" for an object', () => {
      const obj = {};
      expect(typeOf(obj)).toBe(Types.Object);
    });

    it('should return "Array" for an array', () => {
      const arr = [];
      expect(typeOf(arr)).toBe(Types.Array);
    });

    it('should return "Number" for a number', () => {
      const num = 42;
      expect(typeOf(num)).toBe(Types.Number);
    });

    it('should return "String" for a string', () => {
      const str = "Hello";
      expect(typeOf(str)).toBe(Types.String);
    });

    it('should return "Undefined" for undefined', () => {
      const value = undefined;
      expect(typeOf(value)).toBe(Types.Undefined);
    });

    it('should return "Null" for null', () => {
      const value = null;
      expect(typeOf(value)).toBe(Types.Null);
    });

    it('should return "Date" for a Date object', () => {
      const date = new Date();
      expect(typeOf(date)).toBe(Types.Date);
    });

    it('should return "Boolean" for a boolean value', () => {
      const bool = true;
      expect(typeOf(bool)).toBe(Types.Boolean);
    });

    it('should return "RegExp" for a regular expression', () => {
      const regex = /abc/;
      expect(typeOf(regex)).toBe(Types.RegExp);
    });

    it('should return "Function" for a function', () => {
      const func = () => {};
      expect(typeOf(func)).toBe(Types.Function);
    });
  });

  // Tests for isNullOrUndefined function
  describe("isNullOrUndefined function", () => {
    it("should return true for null", () => {
      expect(isNullOrUndefined(null)).toBe(true);
    });

    it("should return true for undefined", () => {
      expect(isNullOrUndefined(undefined)).toBe(true);
    });

    it("should return false for 0", () => {
      expect(isNullOrUndefined(0)).toBe(false);
    });

    it("should return false for an empty string", () => {
      expect(isNullOrUndefined("")).toBe(false);
    });

    it("should return false for false", () => {
      expect(isNullOrUndefined(false)).toBe(false);
    });

    it("should return false for an object", () => {
      expect(isNullOrUndefined({})).toBe(false);
    });

    it("should return false for an array", () => {
      expect(isNullOrUndefined([])).toBe(false);
    });
  });

  describe("isEmptyObject", () => {
    it("should return true for undefined", () => {
      expect(isEmptyObject(undefined)).toBe(true);
    });

    it("should return true for null", () => {
      expect(isEmptyObject(null)).toBe(true);
    });

    it("should return true for an empty array", () => {
      expect(isEmptyObject([])).toBe(true);
    });

    it("should return true for an empty object", () => {
      expect(isEmptyObject({})).toBe(true);
    });

    it("should return false for a non-empty array", () => {
      expect(isEmptyObject([1, 2, 3])).toBe(false);
    });

    it("should return false for a non-empty object", () => {
      expect(isEmptyObject({ a: 1, b: 2 })).toBe(false);
    });

    it("should return false for an object with empty nested objects", () => {
      expect(isEmptyObject({ a: {}, b: 2 })).toBe(false);
    });

    it("should return false for an array of empty objects", () => {
      expect(isEmptyObject([{}, {}])).toBe(false);
    });

    it("should return false for a mixed array with both empty and non-empty objects", () => {
      expect(isEmptyObject([{ a: 1 }, {}])).toBe(false);
    });

    it("should return false for a string (non-object, non-array)", () => {
      expect(isEmptyObject("string")).toBe(false);
    });

    it("should return false for a number (non-object, non-array)", () => {
      expect(isEmptyObject(123)).toBe(false);
    });

    it("should return false for a boolean (non-object, non-array)", () => {
      expect(isEmptyObject(true)).toBe(false);
    });
  });
});
