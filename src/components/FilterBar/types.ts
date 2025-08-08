import { FC } from "react";

export type FilterChipProps<V, P> = {
  value: V[];
  setValue: (v: V[]) => void;
  removeFromBar: () => void;
  filterType: FilterDef<V, P>;
};

export type MenuItemDisplayProps<V, P> = {
  filterType: FilterDef<V, P>;
  menuProps: {
    disabled: boolean;
    onClick: () => void;
  };
};

export type FilterDef<V = any, P = any> = {
  processor: (v: V[]) => P;
  FilterChip: FC<FilterChipProps<V, P>>;
  MenuItem: FC<MenuItemDisplayProps<V, P>>;
  menuLabel: string;
  warning: Warning;
};

export type FilterState<FT extends Record<string, FilterDef>> = {
  [K in keyof FT]: Parameters<FT[K]["processor"]>[0] | null;
};

export type FilterProduct<FT extends Record<string, FilterDef>> = {
  [K in keyof FT]: ReturnType<FT[K]["processor"]> | null;
};

export type FilterRendererProps<FT extends Record<string, FilterDef>> = {
  filterState: FilterState<FT>;
  setFilterState: (newState: FilterState<FT>) => void;
  filterTypes: FT;
};

const warning =
  "if you are typing this, you are doing it wrong! use the createFilter() functions instead";
type Warning = typeof warning;

/**
 * Creates a filter
 */
export const validateFilterType = <V, P>(
  params: Omit<FilterDef<V, P>, "warning">
): FilterDef<V, P> => ({ ...params, warning: "" as Warning });
