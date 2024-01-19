import React, { ReactElement } from "react";
import { ConditionActiveFilter } from "./ConditionFilterBar";
import { FilterOption, FilterType } from "./conditionFilterTypes";
import { FilterChipSelect } from "components/FilterBar/FilterChipSelect";
import { FilterChipMultiSelect } from "components/FilterBar/FilterChipMultiSelect";
import { FilterChipUnit } from "components/FilterBar/FilterChipUnit";

export interface FilterChipProps<T, FILTER_OPTION extends FilterOption<T>> {
  activeFilter: ConditionActiveFilter<T, FILTER_OPTION>;
  setActiveFilter: (
    activeFilter: ConditionActiveFilter<T, FILTER_OPTION>
  ) => void;
  handleDelete: (
    chipToDelete: ConditionActiveFilter<T, FILTER_OPTION>
  ) => () => void;
  activeColor: "primary" | "secondary";
}

export function ConditionFilterChip<T, FILTER_OPTION extends FilterOption<T>>(
  props: FilterChipProps<T, FILTER_OPTION>
): ReactElement {
  const filterTypeMap: Record<FilterType, ReactElement> = {
    select: <FilterChipSelect {...(props as any)} />,
    multiSelect: <FilterChipMultiSelect {...(props as any)} />,
    unit: <FilterChipUnit {...(props as any)} />,
  };

  return filterTypeMap[props.activeFilter.filterOption.type];
}
