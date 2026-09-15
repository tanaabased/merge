# API reference

Public exports for library consumers. See the [README](README.md) for installation and a quick start.

<!-- Generated from TypeScript documentation by bun run docs. Do not edit directly. -->

## Type Aliases

### ArrayMergeStrategy

```ts
type ArrayMergeStrategy =
  'aoa' | 'concat' | 'first' | 'last' | 'merge' | `merge:${string}` | 'replace';
```

Array handling vocabulary. `replace` merges indexes; it does not replace the whole array.
`merge` uses `id`; `merge:<key>` selects a different identity property.

---

### Merge

```ts
type Merge = typeof merge;
```

The callable public contract of `merge`.

---

### MergeArrays

```ts
type MergeArrays = typeof mergeArrays;
```

The callable public contract of `mergeArrays`.

---

### MergeArrayStrategies

```ts
type MergeArrayStrategies = ArrayMergeStrategy | readonly [ArrayMergeStrategy, ArrayMergeStrategy?];
```

Primary array strategy and optional fallback for target arrays without plain objects.

## Variables

### merge

```ts
const merge: {
  <Target, Sources>(object, sources, arrayMergeStrategies?): MergeSources<Target, Sources>;
  <Target, Source>(object, sources, arrayMergeStrategies?): MergeResult<Target, Source>;
} = mergeFunction;
```

#### Call Signature

```ts
<Target, Sources>(
   object,
   sources,
   arrayMergeStrategies?
): MergeSources<Target, Sources>;
```

Deeply merges one or more sources into a mutable target, from left to right.

Array strategies run only when the existing target value is an array; otherwise Lodash's
`mergeWith` controls the merge. With the default primary strategy, target arrays containing
plain objects merge by `id`; other target arrays use the fallback. `replace` means Lodash's
index-based merge, not whole-array replacement. See `mergeArrays` for strategy behavior.

Return types preserve additive properties and conservatively union conflicting values; they
do not model every strategy's overwrite behavior. Unsupported inputs retain incidental
Lodash/native-array behavior, not a validation or coercion contract.

##### Type Parameters

| Type Parameter                          |
| --------------------------------------- |
| `Target` _extends_ `object`             |
| `Sources` _extends_ readonly `object`[] |

##### Parameters

| Parameter               | Type                                            | Description                                                                                                                                              |
| ----------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `object`                | `Target`                                        | Mutable target. The target and its nested values may be mutated.                                                                                         |
| `sources`               | `Sources`                                       | One source object or an ordered array of source objects. An empty array is a no-op.                                                                      |
| `arrayMergeStrategies?` | [`MergeArrayStrategies`](#mergearraystrategies) | Primary strategy or `[primary, fallback]` tuple. Defaults to `['merge:id', 'replace']`; an omitted fallback is `replace`. An empty tuple is unsupported. |

##### Returns

`MergeSources`\<`Target`, `Sources`\>

The same target object, with source values deeply merged into it.

##### Example

```ts
merge({ tags: ['stable'] }, { tags: ['preview'] }, 'concat');
// { tags: ['stable', 'preview'] }
```

#### Call Signature

```ts
<Target, Source>(
   object,
   sources,
   arrayMergeStrategies?
): MergeResult<Target, Source>;
```

Merges one source into the target using the same strategy and mutation rules as the source-list overload.

##### Type Parameters

| Type Parameter              |
| --------------------------- |
| `Target` _extends_ `object` |
| `Source` _extends_ `object` |

##### Parameters

| Parameter               | Type                                            | Description                                                               |
| ----------------------- | ----------------------------------------------- | ------------------------------------------------------------------------- |
| `object`                | `Target`                                        | Mutable target; nested target values may also change.                     |
| `sources`               | `Source`                                        | One source object to merge into the target.                               |
| `arrayMergeStrategies?` | [`MergeArrayStrategies`](#mergearraystrategies) | Strategy or `[primary, fallback]`; defaults to `['merge:id', 'replace']`. |

##### Returns

`MergeResult`\<`Target`, `Source`\>

The same target object. Conflicting value types remain conservative unions.

---

### mergeArrays

```ts
const mergeArrays: {
  <First, Second>(firstArray, secondArray, arrayMergeStrategy): First;
  <First, Second>(firstArray, secondArray, arrayMergeStrategy): Second;
  <First, Second>(firstArray, secondArray, arrayMergeStrategy): (First | Second | First[number])[];
  <First, Second>(firstArray, secondArray, arrayMergeStrategy?): (First[number] | Second[number])[];
} = mergeArraysFunction;
```

#### Call Signature

```ts
<First, Second>(
   firstArray,
   secondArray,
   arrayMergeStrategy
): First;
```

Combines two mutable arrays using a named strategy.

| Strategy                | Behavior                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `replace`               | Lodash-merges indexes into the first array, preserving unmatched trailing entries. |
| `concat`                | Returns a new outer array containing both inputs' entries.                         |
| `first`                 | Returns the first array unchanged by reference.                                    |
| `last`                  | Returns the second array unchanged by reference.                                   |
| `aoa`                   | Nests both arrays when the first has one item; otherwise appends the second array. |
| `merge` / `merge:<key>` | Merges entries by `id` or the named property into a new outer array.               |

Keyed merging expects plain objects with stable unique identifiers. A one-key object without
the requested identifier uses its sole key; other missing identifiers can collide through
JavaScript property-key coercion. A new outer array does not promise a deep clone.
Unsupported inputs retain incidental Lodash/native-array behavior, not a validation contract.

##### Type Parameters

| Type Parameter                 |
| ------------------------------ |
| `First` _extends_ `unknown`[]  |
| `Second` _extends_ `unknown`[] |

##### Parameters

| Parameter            | Type      | Description                                                                 |
| -------------------- | --------- | --------------------------------------------------------------------------- |
| `firstArray`         | `First`   | First mutable array; `replace` mutates it and may mutate its nested values. |
| `secondArray`        | `Second`  | Second mutable array; `last` returns it directly.                           |
| `arrayMergeStrategy` | `"first"` | Strategy to apply. Defaults to `replace`.                                   |

##### Returns

`First`

The selected input for `first`/`last`, the mutated first input for `replace`, or a new
outer array for `concat`, `aoa`, and keyed merging.

##### Example

```ts
mergeArrays([1, 2], [3], 'concat'); // [1, 2, 3]
mergeArrays([{ id: 'app', port: 80 }], [{ id: 'app', secure: true }], 'merge:id');
// [{ id: 'app', port: 80, secure: true }]
```

#### Call Signature

```ts
<First, Second>(
   firstArray,
   secondArray,
   arrayMergeStrategy
): Second;
```

Selects the second input unchanged.

##### Type Parameters

| Type Parameter                 |
| ------------------------------ |
| `First` _extends_ `unknown`[]  |
| `Second` _extends_ `unknown`[] |

##### Parameters

| Parameter            | Type     | Description                      |
| -------------------- | -------- | -------------------------------- |
| `firstArray`         | `First`  | First mutable array.             |
| `secondArray`        | `Second` | Array to return by reference.    |
| `arrayMergeStrategy` | `"last"` | `last` selects the second array. |

##### Returns

`Second`

The second array without cloning or mutation.

#### Call Signature

```ts
<First, Second>(
   firstArray,
   secondArray,
   arrayMergeStrategy
): (First | Second | First[number])[];
```

Groups the inputs without cloning their entries.

##### Type Parameters

| Type Parameter                 |
| ------------------------------ |
| `First` _extends_ `unknown`[]  |
| `Second` _extends_ `unknown`[] |

##### Parameters

| Parameter            | Type     | Description                                                                    |
| -------------------- | -------- | ------------------------------------------------------------------------------ |
| `firstArray`         | `First`  | A single-item array is nested whole; other lengths are spread into the result. |
| `secondArray`        | `Second` | Array appended as one nested element.                                          |
| `arrayMergeStrategy` | `"aoa"`  | `aoa` selects array-of-arrays handling.                                        |

##### Returns

(`First` \| `Second` \| `First`\[`number`\])[]

A new outer array containing the grouped inputs.

#### Call Signature

```ts
<First, Second>(
   firstArray,
   secondArray,
   arrayMergeStrategy?
): (First[number] | Second[number])[];
```

Combines entries using index merging, concatenation, or keyed merging.

##### Type Parameters

| Type Parameter                 |
| ------------------------------ |
| `First` _extends_ `unknown`[]  |
| `Second` _extends_ `unknown`[] |

##### Parameters

| Parameter             | Type                                                              | Description                                                             |
| --------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `firstArray`          | `First`                                                           | Mutable first array; `replace` mutates it and may mutate nested values. |
| `secondArray`         | `Second`                                                          | Mutable second array supplying entries to merge or append.              |
| `arrayMergeStrategy?` | `"concat"` \| `"replace"` \| `` `merge:${string}` `` \| `"merge"` | Defaults to `replace`; `merge` defaults to identity key `id`.           |

##### Returns

(`First`\[`number`\] \| `Second`\[`number`\])[]

The first array for `replace`, or a new outer array for `concat` and keyed merging.
