import { DependencyList, useMemo, useState, useEffect } from "react";
import { FilterDef, FilterProduct, FilterState } from "./types";

export type FilterBarStateUncontrolled<FT extends Record<string, FilterDef>> = {
  /* A definition of the filters included in the filter bar. Use `validateFilterType` to create filters */
  filterDefs: FT;
  /* State of filters */
  initialFilterState?: FilterState<FT>;
  /* Setter for the products when filters are added/removed/changed */
  setProduct: (products: FilterProduct<FT>) => void;
  /* Dependencies for when the Filter Type definition changes (the 'filterTypes' prop) */
  dependencies?: DependencyList;
};

export type FilterBarStateControlled<FT extends Record<string, FilterDef>> = {
  /* A definition of the filters included in the filter bar. Use `validateFilterType` to create filters */
  filterDefs: FT;
  /* Setter for the products when filters are added/removed/changed */
  setProduct: (products: FilterProduct<FT>) => void;
  /* State of filters */
  filterState: FilterState<FT>;
  /* Sets the state of filters when they change */
  setFilterState: (filters: FilterState<FT>) => void;
  /* Dependencies for when the Filter Type definition changes (the 'filterTypes' prop) */
  dependencies?: DependencyList;
};

export const useFilterBarStateControlled = <
  FT extends Record<string, FilterDef>
>(
  props: FilterBarStateControlled<FT>
) => {
  const {
    filterDefs: unMemoizedFilterTypes,
    setProduct,
    filterState,
    setFilterState,
    dependencies,
  } = props;

  const filterTypes = useMemo(
    () => unMemoizedFilterTypes,
    [JSON.stringify(dependencies)]
  );

  useEffect(() => {
    setProduct(
      Object.entries(filterState).reduce((acc, [id, p]) => {
        acc[id] = filterTypes[id].processor(p ?? []);
        return acc;
      }, {} as FilterProduct<FT> as any)
    );
  }, [JSON.stringify(filterState)]);

  return {
    filterState,
    setFilterState: setFilterState,
    filterTypes,
  };
};

export const useFilterBarStateUnControlled = <
  FT extends Record<string, FilterDef>
>(
  props: FilterBarStateUncontrolled<FT>
) => {
  const {
    filterDefs: unMemoizedFilterTypes,
    setProduct,
    dependencies,
    initialFilterState,
  } = props;

  const filterTypes = useMemo(
    () => unMemoizedFilterTypes,
    [JSON.stringify(dependencies)]
  );

  const initFilters = useMemo(() => {
    return (
      initialFilterState ??
      Object.keys(filterTypes).reduce((acc, k) => {
        (acc as any)[k] = null;
        return acc;
      }, {} as FilterState<FT>)
    );
  }, [filterTypes]);

  const [internalFilterState, setInternalFilterState] =
    useState<FilterState<FT>>(initFilters);

  useEffect(() => {
    setInternalFilterState(initFilters);
  }, [JSON.stringify(initFilters)]);

  useEffect(() => {
    setProduct(
      Object.entries(internalFilterState).reduce((acc, [id, p]) => {
        acc[id] = filterTypes[id].processor(p ?? []);
        return acc;
      }, {} as FilterProduct<FT> as any)
    );
  }, [JSON.stringify(internalFilterState)]);

  return {
    filterState: internalFilterState,
    setFilterState: setInternalFilterState,
    filterTypes,
  };
};
