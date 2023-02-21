import React, { ReactElement } from "react";
import { ActiveFilter } from "./FilterBar";
import { FilterChipMultiSelect } from "./FilterChipMultiSelect";
import { FilterChipSelect } from "./FilterChipSelect";
import { FilterChipUnit } from "./FilterChipUnit";
import {
  FilterOption,
  FilterType,
  MultiSelectFilterOption,
  SelectFilterOption,
  UnitFilterOption,
} from "./filterTypes";

export interface FilterChipProps<T, FILTER_OPTION extends FilterOption<T>> {
  activeFilter: ActiveFilter<T, FILTER_OPTION>;
  setActiveFilter: (activeFilter: ActiveFilter<T, FILTER_OPTION>) => void;
  handleDelete: (chipToDelete: ActiveFilter<T, FILTER_OPTION>) => () => void;
  activeColor: "primary" | "secondary";
}

export function FilterChip<T, FILTER_OPTION extends FilterOption<T>>(
  props: FilterChipProps<T, FILTER_OPTION>
): ReactElement {
  const filterTypeMap: Record<FilterType, ReactElement> = {
    [FilterType.SELECT]: (
      <FilterChipSelect
        {...(props as unknown as FilterChipProps<T, SelectFilterOption<T>>)}
      />
    ),
    [FilterType.MULTI_SELECT]: (
      <FilterChipMultiSelect
        {...(props as unknown as FilterChipProps<
          T,
          MultiSelectFilterOption<T>
        >)}
      />
    ),
    [FilterType.UNIT]: (
      <FilterChipUnit
        {...(props as unknown as FilterChipProps<T, UnitFilterOption>)}
      />
    ),
  };

  return filterTypeMap[props.activeFilter.filterOption.type];
}
