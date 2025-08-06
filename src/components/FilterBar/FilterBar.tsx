import { Add } from "@mui/icons-material";
import {
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { FilterType, FilterTypeProcessor, FilterStates } from "./filterUtils";

export type FilterBarProps<FT extends Record<string, FilterType>> = {
  filterTypes: FT;
  setProducts: (
    products: {
      [K in keyof FT]: FilterTypeProcessor<FT[K]>;
    }[keyof FT][]
  ) => void;
  filterState?: FilterStates<FT>;
  setFilterState?: (filters: FilterStates<FT>) => void;
};

export const FilterBar = <FT extends Record<string, FilterType>>(
  props: FilterBarProps<FT>
): React.ReactNode => {
  const { filterTypes, setProducts, filterState, setFilterState } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const initFilters = useMemo(() => {
    if (filterState) {
      return Object.entries(filterState).reduce((acc, [k, v]) => {
        (acc as any)[k] = v;
        return acc;
      }, {} as FilterStates<FT>);
    }
    return Object.keys(filterTypes).reduce((acc, k) => {
      (acc as any)[k] = null;
      return acc;
    }, {} as FilterStates<FT>);
  }, [filterState]);

  const [filters, setFilters] = useState<FilterStates<FT>>(initFilters);

  useEffect(() => {
    setProducts(
      Object.entries(filters)
        .map(([id, p]) => {
          if (p) return filterTypes[id].processor(p ?? []);
          else return null;
        })
        .filter((x) => !!x)
    );
    setFilterState?.(filters);
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    setFilters(initFilters);
  }, [JSON.stringify(initFilters)]);

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
      {Object.keys(filters).length === 0 && (
        <Typography variant="body2" color="grey" fontStyle="italic">
          None
        </Typography>
      )}

      {Object.entries(filters).map(([k, filterValue]) => {
        const filterType = filterTypes[k];

        if (!filterType) return null;
        if (!filterValue) return null;
        return (
          <filterType.FilterChip
            value={filterValue}
            filterType={filterType}
            setValue={(value) => setFilters({ ...filters, [k]: value })}
            remove={() => {
              const copy = { ...filters };
              delete copy[k];
              setFilters(copy);
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
          <Add />
        </IconButton>
      </Tooltip>

      <Menu
        id="add-filter-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        sx={{ maxHeight: "32rem" }}
      >
        {Object.entries(filterTypes).map(([id, ft]) => {
          if (ft.availability === "hidden") return null;
          return (
            <MenuItem
              key={id}
              disabled={
                (filters[id] && filters[id] !== null) ||
                ft.availability === "disabled-inactive"
              }
              onClick={() => {
                setFilters((prev) => ({ ...prev, [id]: [] }));
                setAnchorEl(null);
              }}
            >
              {ft.menuLabel}
            </MenuItem>
          );
        })}
      </Menu>
    </Paper>
  );
};
