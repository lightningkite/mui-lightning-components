import {
  IconButton,
  Menu,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { FilterDef } from "./types";
import { FilterBarState, useFilterBarState } from "./useFilterBar";
import { AddIcon } from "utils/Icons";

export type FilterBarProps<FT extends Record<string, FilterDef>> =
  FilterBarState<FT>;

export const FilterBar = <FT extends Record<string, FilterDef>>(
  props: FilterBarProps<FT>
): React.ReactNode => {
  const { filterState, filterTypes, setFilterState } = useFilterBarState(props);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Paper
      component={Stack}
      direction="row"
      alignItems="center"
      gap={1}
      flexWrap="wrap"
      sx={{ py: 0.5, px: 1, mb: "1rem" }}
    >
      <Typography variant="body2">Filters:</Typography>
      {Object.keys(filterState).length === 0 && (
        <Typography variant="body2" color="grey" fontStyle="italic">
          None
        </Typography>
      )}

      {Object.entries(filterState).map(([k, filterValue]) => {
        const filterType = filterTypes[k];

        if (!filterType) return null;
        if (!filterValue) return null;
        return (
          <filterType.FilterChip
            value={filterValue}
            filterType={filterType}
            setValue={(value) => setFilterState({ ...filterState, [k]: value })}
            removeFromBar={() => {
              const copy = { ...filterState };
              delete copy[k];
              setFilterState(copy);
            }}
            key={k}
          />
        );
      })}

      <Tooltip title="Add a filter">
        <IconButton
          size="small"
          sx={{ ml: "auto" }}
          id="add-filter-button"
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>

      <Menu
        id="add-filter-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        sx={{ maxHeight: "32rem" }}
      >
        {Object.entries(filterTypes).map(([id, ft]) => (
          <ft.MenuItem
            key={id}
            filterType={ft}
            menuProps={{
              disabled: !!(filterState[id] && filterState[id] !== null),
              onClick: () => {
                setFilterState({ ...filterState, [id]: [] });
                setAnchorEl(null);
              },
            }}
          />
        ))}
      </Menu>
    </Paper>
  );
};
