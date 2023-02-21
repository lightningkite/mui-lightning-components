import { ArrowDropDown } from "@mui/icons-material";
import { Chip, Menu, MenuItem, Typography } from "@mui/material";
import React, { ReactElement, useState } from "react";
import { ActiveFilter } from "./FilterBar";
import { MultiSelectFilterOption } from "./filterTypes";

const formatter = new Intl.ListFormat("en", {
  style: "short",
  type: "disjunction",
});

export interface FilterChipMultiSelectProps<T> {
  activeFilter: ActiveFilter<T, MultiSelectFilterOption<T>>;
  setActiveFilter: (
    activeFilter: ActiveFilter<T, MultiSelectFilterOption<T>>
  ) => void;
  handleDelete: (
    chipToDelete: ActiveFilter<T, MultiSelectFilterOption<T>>
  ) => () => void;
}

export function FilterChipMultiSelect<T>(
  props: FilterChipMultiSelectProps<T>
): ReactElement {
  const { activeFilter, setActiveFilter, handleDelete } = props;
  const { value, filterItem } = activeFilter;
  const { optionToLabel, optionToID, options, placeholder } = filterItem;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickOption = (option: T) => {
    const shouldRemove = value.some(
      (v) => optionToID(v) === optionToID(option)
    );
    const newValue = shouldRemove
      ? value.filter((v) => optionToID(v) !== optionToID(option))
      : [...value, option];

    setActiveFilter({
      ...activeFilter,
      value: newValue,
    });
  };

  return (
    <>
      <Chip
        color={value.length ? "secondary" : "default"}
        icon={<ArrowDropDown />}
        label={
          <Typography
            variant="body2"
            fontStyle={value.length ? undefined : "italic"}
          >
            {value.length
              ? formatter.format(value.map(optionToLabel))
              : placeholder}
          </Typography>
        }
        onDelete={handleDelete(activeFilter)}
        clickable
        onClick={handleClick}
        size="small"
      />

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {options.map((option) => {
          const isSelected = value.some(
            (v) => optionToID(v) === optionToID(option)
          );

          return (
            <MenuItem
              key={optionToID(option)}
              onClick={() => handleClickOption(option)}
              selected={isSelected}
              sx={{ fontWeight: isSelected ? "bold" : undefined }}
            >
              {optionToLabel(option)}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}