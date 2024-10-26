# COMPARISON

The join method in `@objectwow/join` offers better performance compared to the join techniques used by `databases, Krakend, Hasura, and GraphQL`. Here’s why:

## Traditional Approach (Database, Krakend, Hasura, GraphQL):

1. Loop through the original array.
2. `For each element, make a call` to the `database/internal/external service` containing the related data by its `UID` (unique identifier).
3. Combine the data from both sources.
4. This results in a time complexity of `O(n x m)`, where `n` is the number of elements in the original array, and `m` is the number of elements fetched from the related table or service.

## @objectwow/join Approach:

1. Provides a `callback function` where the input is `UIDs`, allowing the developer to fetch related data from the `database/internal/external service` in a `single call`.
2. Uses JavaScript’s `new Map` to optimize the process, reducing the time complexity from O(m) to O(1), where `m` is the number of elements retrieved..
3. Combines the data efficiently after retrieving it in bulk through a single call.
4. This results in a time complexity of O(n), where `n` is the number of elements in the original array.

By fetching related data in bulk and leveraging efficient JavaScript data structures, `@objectwow/join` minimizes redundant calls and improves overall performance.

## Tradeoff

Of course, the tools/platforms mentioned above offer capabilities that `@objectwow/join` cannot provide, such as direct connection to the data source, pagination, conditional filtering, and more.
