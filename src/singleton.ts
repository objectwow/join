import { JoinData } from "./core";
import { JoinDataParam, JoinDataResult } from "./type";

export class SingletonJoinData {
  static instance: JoinData;

  private constructor() {}

  static getInstance() {
    if (SingletonJoinData.instance) {
      return SingletonJoinData.instance;
    }

    SingletonJoinData.instance = new JoinData();
    return SingletonJoinData.instance;
  }

  static setInstance(instance: JoinData) {
    SingletonJoinData.instance = instance;
    return SingletonJoinData.instance;
  }
}

export async function joinData(
  params: JoinDataParam,
  metadata?: any
): Promise<JoinDataResult> {
  return SingletonJoinData.getInstance().execute(params, metadata);
}
