import { Add } from "@mui/icons-material";
import {
  IconButton,
  Menu,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { FilterType, FilterTypeProcessor, FilterStates } from "./filterUtils";

export type FilterBarProps<FT extends Record<string, FilterType>> = {
  /* A definition of the filters included in the filter bar. Use `createFilter` or `createBasicFilter` to create filters */
  filterTypes: FT;
  /* Setter for the products when filters are added/removed/changed */
  setProducts: (
    products: {
      [K in keyof FT]: FilterTypeProcessor<FT[K]>;
    }[keyof FT][]
  ) => void;
  /* Optional controlled state of filters */
  filterState?: FilterStates<FT>;
  /* Sets the state of filters when they change */
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

  const [internalFilterState, setInternalFilterState] =
    useState<FilterStates<FT>>(initFilters);

  const actualFilters: FilterStates<FT> = useMemo(() => {
    if (filterState) return filterState;
    else return internalFilterState;
  }, [internalFilterState, filterState]);

  useEffect(() => {
    setProducts(
      Object.entries(actualFilters)
        .map(([id, p]) => {
          if (p) return filterTypes[id].processor(p ?? []);
          else return null;
        })
        .filter((x) => !!x)
    );
    setFilterState?.(internalFilterState);
  }, [JSON.stringify(internalFilterState)]);

  useEffect(() => {
    setInternalFilterState(initFilters);
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
      {Object.keys(actualFilters).length === 0 && (
        <Typography variant="body2" color="grey" fontStyle="italic">
          None
        </Typography>
      )}

      {Object.entries(actualFilters).map(([k, filterValue]) => {
        const filterType = filterTypes[k];

        if (!filterType) return null;
        if (!filterValue) return null;
        return (
          <filterType.FilterChip
            value={filterValue}
            filterType={filterType}
            setValue={(value) =>
              setInternalFilterState({ ...actualFilters, [k]: value })
            }
            remove={() => {
              const copy = { ...actualFilters };
              delete copy[k];
              setInternalFilterState(copy);
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
        {Object.entries(filterTypes).map(([id, ft]) => (
          <ft.MenuItem
            key={id}
            filterType={ft}
            menuProps={{
              disabled: !!(actualFilters[id] && actualFilters[id] !== null),
              onClick: () => {
                setInternalFilterState((prev) => ({ ...prev, [id]: [] }));
                setAnchorEl(null);
              },
            }}
          />
        ))}
      </Menu>
    </Paper>
  );
};
