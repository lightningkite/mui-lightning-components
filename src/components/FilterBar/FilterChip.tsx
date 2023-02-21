import React, { ReactElement } from "react";
import { ActiveFilter } from "./FilterBar";
import {
  FilterChipMultiSelect,
  FilterChipMultiSelectProps,
} from "./FilterChipMultiSelect";
import { FilterChipSelect, FilterChipSelectProps } from "./FilterChipSelect";
import { FilterChipUnit, FilterChipUnitProps } from "./FilterChipUnit";
import { FilterOption, FilterType } from "./filterTypes";

export interface FilterChipProps<T> {
  activeFilter: ActiveFilter<T, FilterOption<T>>;
  setActiveFilter: (activeFilter: ActiveFilter<T, FilterOption<T>>) => void;
  handleDelete: (chipToDelete: ActiveFilter<T, FilterOption<T>>) => () => void;
}

export function FilterChip<T>(props: FilterChipProps<T>): ReactElement {
  const filterTypeMap: Record<FilterType, ReactElement> = {
    [FilterType.SELECT]: (
      <FilterChipSelect {...(props as FilterChipSelectProps<T>)} />
    ),
    [FilterType.MULTI_SELECT]: (
      <FilterChipMultiSelect {...(props as FilterChipMultiSelectProps<T>)} />
    ),
    [FilterType.UNIT]: (
      <FilterChipUnit {...(props as FilterChipUnitProps<T>)} />
    ),
  };

  return filterTypeMap[props.activeFilter.filterItem.type];
}
