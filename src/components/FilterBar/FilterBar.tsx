import { Add } from "@mui/icons-material";
import {
  IconButton,
  Menu,
  MenuItem,
  Paper,
  SxProps,
  Typography,
  Stack,
} from "@mui/material";
import { HoverHelp } from "components/HoverHelp";
import React, { ReactElement, useEffect, useState } from "react";
import { FilterChip } from "./FilterChip";
import { FilterOption, FilterType } from "./filterTypes";

export interface FilterBarProps {
  sx?: SxProps;
  filterOptions: FilterOption<any>[];
  onActiveFiltersChange: (activeFilters: ActiveFilter<any, any>[]) => void;
}

export type FilterTypeValue<
  T,
  FILTER_TYPE extends FilterType
> = FILTER_TYPE extends FilterType.SELECT
  ? T | null
  : FILTER_TYPE extends FilterType.MULTI_SELECT
  ? T[]
  : FILTER_TYPE extends FilterType.UNIT
  ? true
  : never;

export interface ActiveFilter<T, FILTER_OPTION extends FilterOption<T>> {
  id: string;
  filterItem: FILTER_OPTION;
  value: FilterTypeValue<T, FILTER_OPTION["type"]>;
}

const filterOptionDefaultValues: {
  [F in FilterType]: FilterTypeValue<any, F>;
} = {
  [FilterType.SELECT]: null,
  [FilterType.MULTI_SELECT]: [],
  [FilterType.UNIT]: true,
};

export function FilterBar(props: FilterBarProps): ReactElement {
  const { sx, filterOptions, onActiveFiltersChange } = props;

  const [activeFilters, setActiveFilters] = useState<ActiveFilter<any, any>[]>(
    []
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = (chipToDelete: ActiveFilter<any, any>) => () => {
    setActiveFilters(activeFilters.filter((af) => af.id !== chipToDelete.id));
  };

  const updateFilter = (newFilter: ActiveFilter<any, any>) => {
    setActiveFilters(
      activeFilters.map((af) => (af.id === newFilter.id ? newFilter : af))
    );
  };

  useEffect(() => onActiveFiltersChange(activeFilters), [activeFilters]);

  return (
    <Paper
      component={Stack}
      direction="row"
      alignItems="center"
      gap={1}
      flexWrap="wrap"
      sx={{
        py: 0.5,
        px: 1,
        ...sx,
      }}
    >
      <Typography variant="body2">Filters:</Typography>
      {activeFilters.length === 0 && (
        <Typography variant="body2" color="grey" fontStyle="italic">
          None
        </Typography>
      )}
      {activeFilters.map((af) => (
        <FilterChip<any>
          key={af.id}
          activeFilter={af}
          setActiveFilter={updateFilter}
          handleDelete={handleDelete}
        />
      ))}

      <HoverHelp description="Add a filter">
        <IconButton
          size="small"
          sx={{ ml: "auto" }}
          id="add-filter-button"
          aria-controls={open ? "add-filter" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          <Add />
        </IconButton>
      </HoverHelp>

      <Menu
        id="add-filter-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "add-filter-button" }}
      >
        {Object.values(filterOptions)
          .flat()
          .map((filterOption) => (
            <MenuItem
              key={filterOption.name}
              disabled={activeFilters.some(
                (af) => af.filterItem.name === filterOption.name
              )}
              onClick={() => {
                setActiveFilters([
                  ...activeFilters,
                  {
                    id: crypto.randomUUID(),
                    value: filterOptionDefaultValues[filterOption.type],
                    filterItem: filterOption,
                  },
                ]);
                handleClose();
              }}
            >
              {filterOption.name}
            </MenuItem>
          ))}
      </Menu>
    </Paper>
  );
}
