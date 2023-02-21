import { Chip, Typography } from "@mui/material";
import React, { ReactElement } from "react";
import { ActiveFilter } from "./FilterBar";
import { UnitFilterOption } from "./filterTypes";

export interface FilterChipUnitProps<T> {
  activeFilter: ActiveFilter<T, UnitFilterOption>;
  setActiveFilter: (activeFilter: ActiveFilter<T, UnitFilterOption>) => void;
  handleDelete: (chipToDelete: ActiveFilter<T, UnitFilterOption>) => () => void;
}

export function FilterChipUnit<T>(props: FilterChipUnitProps<T>): ReactElement {
  const { activeFilter, handleDelete } = props;
  const { filterItem } = activeFilter;
  const { name } = filterItem;

  return (
    <Chip
      color="secondary"
      label={<Typography variant="body2">{name}</Typography>}
      onDelete={handleDelete(activeFilter)}
      size="small"
    />
  );
}
