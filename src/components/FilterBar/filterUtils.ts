import { FilterType } from "./FilterBar";

export function genericLabel<T>(toString?: (item: T) => string) {
  return (items: T[]) => {
    const strings = toString ? items.map(toString) : (items as string[]);
    if (strings.length > 2) {
      return `${strings[0]}, ${strings[1]}, and ${strings.length - 2} more`;
    }
    return strings.join(", ");
  };
}

export const createFilter = <V, P>(x: FilterType<V, P>) => x;
