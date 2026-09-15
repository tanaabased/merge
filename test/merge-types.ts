import { merge, mergeArrays } from '../index.js';
import type { Merge, MergeArrays } from '../index.js';

const mergeContract: Merge = merge;
const arrayContract: MergeArrays = mergeArrays;
const additive = mergeContract({ nested: { left: 1 } }, { nested: { right: 'ready' } });
additive.nested.left.toFixed();
additive.nested.right.toUpperCase();

const conflict = merge({ value: 1 }, { value: 'new' });
const value: number | string = conflict.value;
// @ts-expect-error Conflicting values must not collapse to never.
const impossible: never = conflict.value;
// @ts-expect-error A conflict cannot promise the original number methods.
conflict.value.toFixed();

const optionalSource: { value?: string; optional?: boolean } = {};
const optional = merge({ value: 1 }, optionalSource);
const optionalValue: number | string | undefined = optional.value;
const optionalProperty: boolean | undefined = optional.optional;
const empty = merge({ untouched: true }, [] as const);
empty.untouched.valueOf();
const ordered = merge({}, [{ first: 1 }, { second: 'two' }] as const);
ordered.first.toFixed();
ordered.second.toUpperCase();
const variableSources: { maybe: string }[] = [];
const variable = merge({ preserved: 1 }, variableSources);
variable.preserved.toFixed();
// @ts-expect-error A dynamically sized source list can be empty.
variable.maybe.toUpperCase();
arrayContract([1], ['two'], 'last')[0]?.toUpperCase();
arrayContract([1], ['two'], 'first')[0]?.toFixed();
void [value, impossible, optionalValue, optionalProperty];
