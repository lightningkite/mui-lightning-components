import { useState } from "react";
import { usePersistentState } from "../../utils";
import { FilterStates, FilterType } from "./filterUtils";

export const useFilterBar = <T extends Record<string, FilterType>>(
  filterTypes: T,
  initState?: FilterStates<T>
) => {
  const [filterState, setFilterState] = useState<FilterStates<T>>(
    initState ??
      Object.keys(filterTypes).reduce((acc, key) => {
        (acc as any)[key] = null;
        return acc;
      }, {} as any)
  );

  return { filterTypes: filterTypes, filterState, setFilterState };
};

export const useFilterBarSaveLocally = <T extends Record<string, FilterType>>(
  filterTypes: T,
  initState?: FilterStates<T>,
  localStorageKey?: string
) => {
  const [filterState, setFilterState] = usePersistentState<FilterStates<T>>(
    localStorageKey ?? JSON.stringify(filterTypes),
    initState ??
      Object.keys(filterTypes).reduce((acc, key) => {
        (acc as any)[key] = null;
        return acc;
      }, {} as FilterStates<T>)
  );

  return { filterTypes: filterTypes, filterState, setFilterState };
};
