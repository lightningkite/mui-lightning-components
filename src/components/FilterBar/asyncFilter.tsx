import { FC } from "react";
import { FilterChipProps, genericFilterLabel } from "./filterUtils";
import { PopoverWrapper } from "./PopoverWrapper";
import {
  RestAutocompleteInput,
  RestAutocompleteInputProps,
} from "components/Autocomplete/RestAutocompleteInput";
import { Stack } from "@mui/material";

export type AsyncMultiSelectFilterChip<V> = {
  itemGetter: RestAutocompleteInputProps<V, any>["itemGetter"];
  optionToId: (v: V) => string;
  getOptionLabel: (value: V) => string;
  displayValues?: (v: V[]) => string;
};

/**
 * Creates a filter chip that can have multiple values selected out of asynchronously fetched items
 */
export const createAsyncMultiSelectFilterChip = <V, P>(
  props: AsyncMultiSelectFilterChip<V>
): FC<FilterChipProps<V, P>> => {
  return function Wrapper(innerProps: FilterChipProps<V, P>) {
    const {
      getOptionLabel,
      optionToId,
      displayValues = genericFilterLabel(getOptionLabel),
      itemGetter,
    } = props;

    const { value, setValue } = innerProps;

    return (
      <PopoverWrapper
        {...innerProps}
        displayValues={(value) =>
          value.length > 0
            ? displayValues(value)
            : innerProps.filterType.menuLabel
        }
      >
        <Stack width="20rem" padding={2}>
          <RestAutocompleteInput
            itemGetter={itemGetter}
            getOptionLabel={getOptionLabel}
            value={value}
            multiple
            onChange={setValue}
            getOptionId={optionToId}
          />
        </Stack>
      </PopoverWrapper>
    );
  };
};
