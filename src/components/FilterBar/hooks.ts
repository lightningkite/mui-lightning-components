import { useCallback, useMemo, useState } from "react";
import { usePersistentState } from "../../utils";
import { FilterState, FilterDef } from "./types";

export const useFilterBarSaveLocally = <T extends Record<string, FilterDef>>(
  filterDefs: T,
  initState?: FilterState<T>,
  localStorageKey?: string
) => {
  const [filterState, setFilterState] = usePersistentState<FilterState<T>>(
    localStorageKey ?? JSON.stringify(filterDefs),
    initState ??
      Object.keys(filterDefs).reduce((acc, key) => {
        (acc as any)[key] = null;
        return acc;
      }, {} as FilterState<T>)
  );

  return { filterDefs: filterDefs, filterState, setFilterState };
};
