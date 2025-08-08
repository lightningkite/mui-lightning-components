import { MenuList, MenuItem } from "@mui/material";
import { FC } from "react";
import { FilterChipProps, genericFilterLabel } from "../filterUtils";
import { FilterChipPopoverWrapper } from "./FilterChipPopoverWrapper";

export type SelectFilterChipProps<V> = {
  options: V[];
  optionToId: (v: V) => string;
  getOptionLabel: (value: V) => string;
  displayValues?: (v: V[]) => string;
};

/**
 * Creates a filter chip that can have multiple values selected
 */
export const createMultiSelectFilterChip = <V, P>(
  props: SelectFilterChipProps<V>
): FC<FilterChipProps<V, P>> => {
  return function Wrapper(innerProps: FilterChipProps<V, P>) {
    const {
      getOptionLabel,
      optionToId,
      options,
      displayValues = genericFilterLabel(getOptionLabel),
    } = props;

    return (
      <FilterChipPopoverWrapper
        {...innerProps}
        displayValues={(value) =>
          value.length > 0
            ? displayValues(value)
            : innerProps.filterType.menuLabel
        }
      >
        <MenuList>
          {options.map((option, i) => {
            const isSelected = innerProps.value.some(
              (v) => optionToId(option) === optionToId(v)
            );

            return (
              <MenuItem
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  const isSelected = innerProps.value.some(
                    (v) => props.optionToId(option) === props.optionToId(v)
                  );
                  if (isSelected) {
                    const without = innerProps.value.filter(
                      (v) => props.optionToId(option) !== props.optionToId(v)
                    );
                    innerProps.setValue([...without]);
                  } else {
                    innerProps.setValue([...innerProps.value, option]);
                  }
                }}
                selected={isSelected}
                sx={{ fontWeight: isSelected ? "bold" : undefined }}
              >
                {getOptionLabel(option)}
              </MenuItem>
            );
          })}
        </MenuList>
      </FilterChipPopoverWrapper>
    );
  };
};

/**
 * Creates a filter chip that can have just a single value selected
 */
export const createSingleSelectFilterChip = <V, P>(
  props: SelectFilterChipProps<V>
): FC<FilterChipProps<V, P>> => {
  return function Wrapper(innerProps: FilterChipProps<V, P>) {
    const {
      getOptionLabel,
      optionToId,
      options,
      displayValues = genericFilterLabel(getOptionLabel),
    } = props;

    return (
      <FilterChipPopoverWrapper
        {...innerProps}
        displayValues={(value) =>
          value.length > 0
            ? displayValues(value)
            : innerProps.filterType.menuLabel
        }
      >
        <MenuList>
          {options.map((option, i) => {
            const isSelected = innerProps.value.some(
              (v) => optionToId(option) === optionToId(v)
            );

            return (
              <MenuItem
                key={i}
                onClick={(e) => {
                  e.preventDefault();

                  const isSelected = innerProps.value.some(
                    (v) => props.optionToId(option) === props.optionToId(v)
                  );
                  if (isSelected) {
                    return innerProps.setValue([]);
                  } else {
                    return innerProps.setValue([option]);
                  }
                }}
                selected={isSelected}
                sx={{ fontWeight: isSelected ? "bold" : undefined }}
              >
                {getOptionLabel(option)}
              </MenuItem>
            );
          })}
        </MenuList>
      </FilterChipPopoverWrapper>
    );
  };
};
