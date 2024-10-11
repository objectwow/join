import { SingletonJoinData, joinData } from "../src/singleton";
import { JoinData } from "../src/core";
import { JoinDataParam, JoinDataResult } from "../src/type";

describe("SingletonJoinData and joinData", () => {
  afterEach(() => {
    // Reset the Singleton instance after each test
    SingletonJoinData.instance = undefined;
  });

  describe("SingletonJoinData", () => {
    it("should return the same instance when getInstance is called multiple times", () => {
      const instance1 = SingletonJoinData.getInstance();
      const instance2 = SingletonJoinData.getInstance();

      expect(instance1).toBe(instance2);
    });

    it("should return the manually set instance when setInstance is called", () => {
      const mockJoinDataInstance = new JoinData();
      const setInstance = SingletonJoinData.setInstance(mockJoinDataInstance);

      expect(SingletonJoinData.getInstance()).toBe(setInstance);
    });

    it("should return the different instance when create new class extend SingletonJoinData", () => {
      const instance1 = SingletonJoinData.getInstance();

      class JoinData2 extends JoinData {}
      class SingletonJoinData2 extends SingletonJoinData {}
      const instance2 = SingletonJoinData2.setInstance(new JoinData2());

      expect(instance1).not.toBe(instance2);
    });
  });

  describe("joinData function", () => {
    it("should call the execute method of the JoinData instance with the correct parameters", async () => {
      const params: JoinDataParam = {
        from: () => ({}),
        local: {},
        localField: "id",
        fromField: "foreignId",
        as: "result",
      };

      const expectedResult: JoinDataResult = {
        joinFailedValues: [],
        allSuccess: true,
      };

      const result = await joinData(params);
      expect(result).toEqual(expectedResult);
    });
  });
});
