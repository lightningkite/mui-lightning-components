import React, { ReactElement } from "react";
import { ConditionActiveFilter } from "./ConditionFilterBar";
import {
  ConSelectFilterOption,
  FilterOption,
  FilterType,
} from "./conditionFilterTypes";
import { FilterChipSelect } from "components/FilterBar/FilterChipSelect";
import { FilterChipMultiSelect } from "components/FilterBar/FilterChipMultiSelect";
import { FilterChipUnit } from "components/FilterBar/FilterChipUnit";
import { HasId } from "@lightningkite/lightning-server-simplified";
import { toRequiredSelect } from "components/FilterBar/helpers";
import { ActiveFilter, SelectFilterOption } from "components/FilterBar";

export interface FilterChipProps<
  T extends HasId,
  FILTER_OPTION extends FilterOption<any>
> {
  activeFilter: ConditionActiveFilter<T, FILTER_OPTION>;
  setActiveFilter: (
    activeFilter: ConditionActiveFilter<T, FILTER_OPTION>
  ) => void;
  handleDelete: (
    chipToDelete: ConditionActiveFilter<T, FILTER_OPTION>
  ) => () => void;
  activeColor: "primary" | "secondary";
}

export function ConditionFilterChip<
  T extends HasId,
  FILTER_OPTION extends FilterOption<T>
>(props: FilterChipProps<T, FILTER_OPTION>): ReactElement {
  const filterTypeMap: Record<FilterType, ReactElement> = {
    select: (
      <FilterChipSelect
        {...(props as any)}
        activeFilter={toRequiredSelect(
          props.activeFilter as ActiveFilter<T, SelectFilterOption<T>>
        )}
      />
    ),
    multiSelect: <FilterChipMultiSelect {...(props as any)} />,
    unit: <FilterChipUnit {...(props as any)} />,
  };

  return filterTypeMap[props.activeFilter.filterOption.type];
}
