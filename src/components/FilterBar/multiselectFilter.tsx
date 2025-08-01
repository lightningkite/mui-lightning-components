import { Close } from "@mui/icons-material";
import {
  Tooltip,
  Chip,
  Typography,
  Popover,
  Stack,
  IconButton,
  MenuList,
  MenuItem,
} from "@mui/material";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import { useState } from "react";
import { FilterChipProps } from "./FilterBar";
import { genericLabel } from "./filterUtils";

type SelectFilterChipProps<V> = {
  options: V[];
  optionToId: (v: V) => string;
  displayValue: (value: V) => string;
  displayValues?: (v: V[]) => string;
};

export const createSelectFilterChip = <V, P>(
  props: SelectFilterChipProps<V>
) => {
  return function Wrapper(innerProps: FilterChipProps<V, P>) {
    return <SelectFilterChipInner {...props} {...innerProps} />;
  };
};

export const createMultiSelectFilterChip = <V, P>(
  props: SelectFilterChipProps<V>
) => {
  return function Wrapper(innerProps: FilterChipProps<V, P>) {
    return <MultiSelectFilterChipInner {...props} {...innerProps} />;
  };
};

export const SelectFilterChipInner = <V, P>(
  props: FilterChipProps<V, P> & SelectFilterChipProps<V>
) => {
  const { value, setValue, optionToId } = props;
  return (
    <FilterChipInner
      {...props}
      onClickValue={(option) => {
        const isSelected = value.some(
          (v) => optionToId(option) === optionToId(v)
        );
        if (!isSelected) return setValue([option]);
      }}
    />
  );
};

export const MultiSelectFilterChipInner = <V, P>(
  props: FilterChipProps<V, P> & SelectFilterChipProps<V>
) => {
  const { value, setValue, optionToId } = props;
  return (
    <FilterChipInner
      {...props}
      onClickValue={(option) => {
        const isSelected = value.some(
          (v) => optionToId(option) === optionToId(v)
        );
        if (isSelected) {
          const without = value.filter(
            (v) => optionToId(option) !== optionToId(v)
          );
          setValue([...without]);
        } else {
          setValue([...value, option]);
        }
      }}
    />
  );
};

const FilterChipInner = <V, P>(
  props: FilterChipProps<V, P> &
    SelectFilterChipProps<V> & {
      onClickValue: (v: V) => void;
    }
) => {
  const {
    filterType,
    value,
    remove,
    displayValue,
    displayValues = genericLabel(displayValue),
    options,
    optionToId,
  } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const isActive = value.length > 0;

  return (
    <>
      <Tooltip title={filterType.menuLabel}>
        <Chip
          icon={<ArrowDropDownIcon />}
          color={isActive ? "primary" : "default"}
          label={
            <Typography
              variant="body2"
              fontStyle={isActive ? undefined : "italic"}
            >
              {value.length > 0 ? displayValues(value) : filterType.menuLabel}
            </Typography>
          }
          clickable
          onClick={(event) => setAnchorEl(event.currentTarget)}
          size="small"
        />
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        keepMounted
      >
        <Stack>
          <IconButton
            onClick={() => remove()}
            size="small"
            sx={{ alignSelf: "flex-end" }}
          >
            <Close fontSize={"small"} />
          </IconButton>
          <MenuList>
            {options.map((option, i) => {
              const isSelected = value.some(
                (v) => optionToId(option) === optionToId(v)
              );

              return (
                <MenuItem
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    props.onClickValue(option);
                  }}
                  selected={isSelected}
                  sx={{ fontWeight: isSelected ? "bold" : undefined }}
                >
                  {displayValue(option)}
                </MenuItem>
              );
            })}
          </MenuList>
        </Stack>
      </Popover>
    </>
  );
};
