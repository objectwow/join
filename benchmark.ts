// benchmark.ts

import { Benchmark } from "benchmark";
import { joinData } from "./index"; // Import your core function/module

const suite = new Benchmark.Suite();

// Example input data
const localData = { id: 1, name: "LocalName" };
const fromData = [{ id: 1, name: "Alice", age: 25 }];

// Add your benchmarks
suite
  .add("JoinData Execution", () => {
    // Call the method you want to benchmark
    joinData({
      local: localData,
      from: () => fromData,
      localField: "id",
      fromField: "id",
      asMap: undefined,
      as: "from",
    });
  })
  .on("cycle", (event: any) => {
    console.log(String(event.target));
  })
  .on("complete", function () {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .run({ async: true });
