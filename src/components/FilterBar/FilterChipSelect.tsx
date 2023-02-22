import { ArrowDropDown } from "@mui/icons-material";
import { Chip, Menu, MenuItem, Typography } from "@mui/material";
import React, { ReactElement, useState } from "react";
import { FilterChipProps } from "./FilterChip";
import { SelectFilterOption } from "./filterTypes";

export function FilterChipSelect<T>(
  props: FilterChipProps<T, SelectFilterOption<T>>
): ReactElement {
  const { activeFilter, setActiveFilter, handleDelete, activeColor } = props;
  const { value, filterOption } = activeFilter;
  const { optionToLabel, optionToID, options, placeholder } = filterOption;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Chip
        color={value ? activeColor : "default"}
        icon={<ArrowDropDown />}
        label={
          <Typography variant="body2" fontStyle={value ? undefined : "italic"}>
            {value ? optionToLabel(value) : placeholder}
          </Typography>
        }
        onDelete={handleDelete(activeFilter)}
        clickable
        onClick={handleClick}
        size="small"
      />

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {options.map((option) => {
          return (
            <MenuItem
              key={optionToID(option)}
              onClick={() => {
                setActiveFilter({
                  ...activeFilter,
                  value: option,
                });
                handleClose();
              }}
              selected={!!value && optionToID(option) === optionToID(value)}
            >
              {optionToLabel(option)}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
