import { DependencyList, useMemo, useState, useEffect } from "react";
import { FilterDef, FilterProduct, FilterState } from "./types";

export type FilterBarState<FT extends Record<string, FilterDef>> = {
  /* A definition of the filters included in the filter bar. Use `validateFilterType` to create filters */
  filterDefs: FT;
  /* Setter for the products when filters are added/removed/changed */
  setProduct: (products: FilterProduct<FT>) => void;
  /* Optional controlled state of filters */
  filterState?: FilterState<FT>;
  /* Sets the state of filters when they change */
  setFilterState?: (filters: FilterState<FT>) => void;
  /* Dependencies for when the Filter Type definition changes (the 'filterTypes' prop) */
  dependencies?: DependencyList;
};

// Handles either controlled or uncontrolled state for filters
export const useFilterBarState = <FT extends Record<string, FilterDef>>(
  props: FilterBarState<FT>
) => {
  const {
    filterDefs: unMemoizedFilterTypes,
    setProduct,
    filterState: externalFilterState,
    setFilterState,
    dependencies,
  } = props;

  const filterTypes = useMemo(
    () => unMemoizedFilterTypes,
    [JSON.stringify(dependencies)]
  );

  const initFilters = useMemo(() => {
    if (externalFilterState) {
      return Object.entries(externalFilterState).reduce((acc, [k, v]) => {
        (acc as any)[k] = v;
        return acc;
      }, {} as FilterState<FT>);
    }
    return Object.keys(filterTypes).reduce((acc, k) => {
      (acc as any)[k] = null;
      return acc;
    }, {} as FilterState<FT>);
  }, [filterTypes]);

  const [internalFilterState, setInternalFilterState] =
    useState<FilterState<FT>>(initFilters);

  useEffect(() => {
    setInternalFilterState(initFilters);
  }, [JSON.stringify(initFilters)]);

  const filterState: FilterState<FT> = useMemo(() => {
    if (externalFilterState) return externalFilterState;
    else return internalFilterState;
  }, [internalFilterState, externalFilterState]);

  useEffect(() => {
    setProduct(
      Object.entries(filterState).reduce((acc, [id, p]) => {
        acc[id] = filterTypes[id].processor(p ?? []);
        return acc;
      }, {} as FilterProduct<FT> as any)
    );
    setFilterState?.(internalFilterState);
  }, [JSON.stringify(filterState), JSON.stringify(internalFilterState)]);

  return {
    filterState,
    setFilterState: setFilterState ?? setInternalFilterState,
    filterTypes,
  };
};
