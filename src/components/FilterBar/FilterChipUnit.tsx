import { Chip, Typography } from "@mui/material";
import React, { ReactElement } from "react";
import { FilterChipProps } from "./FilterChip";
import { UnitFilterOption } from "./filterTypes";

export function FilterChipUnit<T>(
  props: FilterChipProps<T, UnitFilterOption>
): ReactElement {
  const { activeFilter, handleDelete, activeColor } = props;
  const { filterOption } = activeFilter;
  const { name } = filterOption;

  return (
    <Chip
      color={activeColor}
      label={<Typography variant="body2">{name}</Typography>}
      onDelete={handleDelete(activeFilter)}
      size="small"
    />
  );
}
