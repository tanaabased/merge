type UnionToIntersection<Union> = (
  Union extends unknown ? (argument: Union) => void : never
) extends (argument: infer Intersection) => void
  ? Intersection
  : never;

type Merged<Objects extends readonly object[]> = {
  [Key in keyof UnionToIntersection<Objects[number]>]: UnionToIntersection<Objects[number]>[Key];
};

export default function merge<Objects extends readonly object[]>(
  ...objects: Objects
): Merged<Objects> {
  return Object.assign({}, ...objects) as Merged<Objects>;
}
