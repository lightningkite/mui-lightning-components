import { ArrowDropDown } from "@mui/icons-material";
import { Chip, Menu, MenuItem, Typography } from "@mui/material";
import React, { ReactElement, useState } from "react";
import { FilterChipProps } from "./FilterChip";
import { MultiSelectFilterOption } from "./filterTypes";

const conjunctionFormatter = new Intl.ListFormat("en-US", {
  style: "short",
  type: "conjunction",
});

export function FilterChipMultiSelect<T>(
  props: FilterChipProps<T, MultiSelectFilterOption<T>>
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

  const labels = value.map(optionToLabel);

  return (
    <>
      <Chip
        color={value.length ? activeColor : "default"}
        icon={<ArrowDropDown />}
        label={
          <Typography
            variant="body2"
            fontStyle={value.length ? undefined : "italic"}
          >
            {labels.length
              ? conjunctionFormatter.format(
                  labels.length <= 3
                    ? labels
                    : [labels[0], labels[1], `${labels.length - 2} more`]
                )
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
