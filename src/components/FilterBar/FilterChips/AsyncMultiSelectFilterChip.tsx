import { FC } from "react";
import { FilterChipProps } from "../types";
import { FilterChipPopoverWrapper } from "./FilterChipPopoverWrapper";
import { RestAutocompleteInput } from "components/Autocomplete/RestAutocompleteInput";
import { Stack } from "@mui/material";
import { genericFilterLabel } from "../utils";

export type AsyncMultiSelectFilterChipProps<V> = {
  itemGetter: (searchText: string) => Promise<V[]>;
  optionToId: (v: V) => string;
  getOptionLabel: (value: V) => string;
  displayValues?: (v: V[]) => string;
  label?: string;
};

/**
 * Creates a filter chip that can have multiple values selected out of asynchronously fetched items
 */
export const AsyncMultiSelectFilterChip = <V, P>(
  props: AsyncMultiSelectFilterChipProps<V>
): FC<FilterChipProps<V, P>> => {
  return function Wrapper(innerProps: FilterChipProps<V, P>) {
    const {
      getOptionLabel,
      optionToId,
      displayValues = genericFilterLabel(getOptionLabel),
      itemGetter,
      label
    } = props;

    const { value, setValue } = innerProps;

    return (
      <FilterChipPopoverWrapper
        {...innerProps}
        displayValues={(value) =>
          value.length > 0
            ? displayValues(value)
            : innerProps.filterType.menuLabel
        }
      >
        <Stack width="20rem" padding={2}>
          <RestAutocompleteInput
            label={label}
            itemGetter={itemGetter}
            getOptionLabel={getOptionLabel}
            value={value}
            multiple
            onChange={setValue}
            getOptionId={optionToId}
          />
        </Stack>
      </FilterChipPopoverWrapper>
    );
  };
};
