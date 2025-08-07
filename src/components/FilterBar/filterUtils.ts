import { FC } from "react";
import {
  BasicMenuItemDisplayProps,
  createBasicMenuItemDisplay,
} from "./MenuItem";

export type FilterChipProps<V, P> = {
  value: V[];
  setValue: (v: V[]) => void;
  remove: () => void;
  filterType: FilterType<V, P>;
};

export type MenuItemDisplayProps<V, P> = {
  filterType: FilterType<V, P>;
  menuProps: {
    disabled: boolean;
    onClick: () => void;
  };
};

export type FilterType<V = any, P = any> = {
  processor: (v: V[]) => P;
  FilterChip: FC<FilterChipProps<V, P>>;
  MenuItem: FC<MenuItemDisplayProps<V, P>>;
  menuLabel: string;
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

/**
 * Creates a filter. This is more configurable than `createBasicFilter`.
 */
export const createFilter = <V, P>(
  params: Omit<FilterType<V, P>, "warning">
): FilterType<V, P> => ({ ...params, warning: "" as Warning });

/**
 * Creates a filter. This is less configurable than `createFilter`.
 */
export const createBasicFilter = <V, P>(
  params: Omit<FilterType<V, P>, "warning" | "MenuItem"> & {
    menuItem?: BasicMenuItemDisplayProps<V>;
  }
): FilterType<V, P> => {
  return {
    ...params,
    MenuItem: createBasicMenuItemDisplay(
      params.menuItem ?? { availability: "available" }
    ),
    warning: "" as Warning,
  };
};
