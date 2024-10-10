import { SingletonJoinData, joinData } from '../src/singleton';
import { JoinData } from '../src/core';
import { JoinDataParam, JoinDataResult } from '../src/type';

jest.mock('../src/core', () => ({
  JoinData: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}));

describe('SingletonJoinData and joinData', () => {
  afterEach(() => {
    // Reset the Singleton instance after each test
    SingletonJoinData.instance = undefined;
  });

  describe('SingletonJoinData', () => {
    it('should return the same instance when getInstance is called multiple times', () => {
      const instance1 = SingletonJoinData.getInstance();
      const instance2 = SingletonJoinData.getInstance();

      expect(instance1).toBe(instance2);
    });


    it('should return the manually set instance when setInstance is called', () => {
      const mockJoinDataInstance = new JoinData();
      const setInstance = SingletonJoinData.setInstance(mockJoinDataInstance);

      expect(SingletonJoinData.getInstance()).toBe(setInstance);
    });
  });

  describe('joinData function', () => {
    it('should call the execute method of the JoinData instance with the correct parameters', async () => {
      const mockJoinDataInstance = new JoinData();
      const mockExecute = mockJoinDataInstance.execute as jest.Mock;

      SingletonJoinData.setInstance(mockJoinDataInstance);

      const params: JoinDataParam<any> = {
        from: jest.fn(),
        local: {},
        localField: 'id',
        fromField: 'foreignId',
        as: 'result',
      };

      const expectedResult: JoinDataResult = {
        joinFailedValues: [],
        allSuccess: true,
      };

      mockExecute.mockResolvedValueOnce(expectedResult);

      const result = await joinData(params);

      expect(mockExecute).toHaveBeenCalledWith(params, undefined);
      expect(result).toBe(expectedResult);
    });

    it('should pass metadata correctly to the execute method', async () => {
      const mockJoinDataInstance = new JoinData();
      const mockExecute = mockJoinDataInstance.execute as jest.Mock;

      SingletonJoinData.setInstance(mockJoinDataInstance);

      const params: JoinDataParam<any> = {
        from: jest.fn(),
        local: {},
        localField: 'id',
        fromField: 'foreignId',
        as: 'result',
      };

      const metadata = { someKey: 'someValue' };

      const expectedResult: JoinDataResult = {
        joinFailedValues: [],
        allSuccess: true,
      };

      mockExecute.mockResolvedValueOnce(expectedResult);

      const result = await joinData(params, metadata);

      expect(mockExecute).toHaveBeenCalledWith(params, metadata);
      expect(result).toBe(expectedResult);
    });
  });
});
