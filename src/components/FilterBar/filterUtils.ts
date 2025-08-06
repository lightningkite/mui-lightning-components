import { FC } from "react";

export type FilterChipProps<V, P> = {
  value: V[];
  setValue: (v: V[]) => void;
  remove: () => void;
  filterType: FilterType<V, P>;
};

export type FilterType<V = any, P = any> = {
  processor: (v: V[]) => P;
  FilterChip: FC<FilterChipProps<V, P>>;
  menuLabel: string;
  availability?: "hidden" | "disabled-inactive" | "available";
  warning: Warning;
};

export type FilterTypeValue<FT extends FilterType> = Parameters<
  FT["processor"]
>[0];
export type FilterTypeProcessor<FT extends FilterType> = ReturnType<
  FT["processor"]
>;
export type FilterStates<FT extends Record<string, FilterType>> = {
  [K in keyof FT]: FilterTypeValue<FT[K]> | null;
};

const warning =
  "if you are typing this, you are doing it wrong! use the createFilter() functions instead";
type Warning = typeof warning;

export function genericFilterLabel<T>(toString?: (item: T) => string) {
  return (items: T[]) => {
    const strings = toString ? items.map(toString) : (items as string[]);
    if (strings.length > 2) {
      return `${strings[0]}, ${strings[1]}, and ${strings.length - 2} more`;
    }
    return strings.join(", ");
  };
}

export const createFilter = <V, P>(
  x: Omit<FilterType<V, P>, "warning">
): FilterType<V, P> => ({ ...x, warning: "" as Warning });
