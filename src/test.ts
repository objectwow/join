import { joinData } from "./singleton";



async function start() {
	const local = [
		{
			_id: 1,
			name: "abc",
			provinceIds: ["1", "2", "3", "4"],
			test: {
				provinceId: "3",
			},
		},
		{
			_id: 1,
			name: "abc",
			provinceIds: ["1", "2", "3", "4"],
			provinceId: "1",
			test: {
				provinceId: "3",
			},
		},
	];

	const fromArr = [
		{
			id: "1",
			name: "HCM",
			code: "HCM",
			deep: {
				d: 1
			}
		},
		{
			id: "3",
			name: "HN",
			code: "HN",
			deep: {
				d: 2
			}
		},
	];

	const fromObj = {
		id: "3",
		test2: {
			id: "3",
			test2Name: "abc",
		},
		name: "HN",
	};

	// const result = await joinData({
	//   local,
	//   from: () => fromArr,
	//   localField: "provinceIds",
	//   fromField: "id",
	//   as: "provinces",
	//   asMap: {
	//     id: "id",
	//     name: "name",
	//   }
	// });

	// console.log(result);

	// const result2 = await joinData({
	//   local,
	//   from: async () => fromObj,
	//   localField: "test.provinceId",
	//   fromField: "test2.id",
	//   as: "item",
	//   asMap: {
	//     fromProvinceId: "id",
	//     fromProvinceName: "name",
	//     fromTest2name: "test2.test2Name"
	//   },
	// });
	// console.log(result2);

	const result3 = await joinData({
		local,
		from: () => fromArr,
		localField: "provinceIds",
		fromField: "id",
		asMap: {
			fromProvinceId: "id",
			fromProvinceName: "name",
			deep: "deep.d"
		},
		as: "provinces",
	});

	console.log(result3);


	console.dir(local, { depth: null });
}

start();