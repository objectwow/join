import { JoinData } from "./core"
import { JoinDataParam } from "./type"

export class SingletonJoinData {
	static instance: JoinData

	private constructor() { }

	static getInstance() {
		if (SingletonJoinData.instance) {
			return SingletonJoinData.instance
		}

		SingletonJoinData.instance = new JoinData()
		return SingletonJoinData.instance
	}

	static setInstance(instance: JoinData){
		SingletonJoinData.instance = instance
		return SingletonJoinData.instance
	}
}

export async function joinData<FromFn extends (...args: any[]) => any>(params: JoinDataParam<FromFn>) {
	return SingletonJoinData.getInstance().execute(params)
}