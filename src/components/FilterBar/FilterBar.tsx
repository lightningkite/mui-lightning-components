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
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";

export type FilterChipProps<V, P> = {
  value: V[];
  setValue: (v: V[]) => void;
  remove: () => void;
  filterType: FilterType<V, P>;
};

export type FilterType<V = any, P = any> = {
  processor: (v: V[]) => P;
  FilterChip: FC<FilterChipProps<V, P>>;
  menuLabel: string;
  state: V[] | null;
  availability?: "hidden" | "disabled-inactive" | "available";
};

type ValueOf<FT extends FilterType> = Parameters<FT["processor"]>[0];
type ProcessorOf<FT extends FilterType> = ReturnType<FT["processor"]>;

type FilterStates<FT extends Record<string, FilterType>> = {
  [K in keyof FT]: ValueOf<FT[K]> | null;
};

export const FilterBar = <FT extends Record<string, FilterType>>(props: {
  filterTypes: FT;
  setProducts: (
    products: { [K in keyof FT]: ProcessorOf<FT[K]> }[keyof FT][]
  ) => void;
  setFilterState?: (filters: FilterStates<FT>) => void;
}): React.ReactNode => {
  const { filterTypes, setProducts, setFilterState } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const initFilters = useMemo(
    () =>
      Object.keys(filterTypes).reduce((acc, k) => {
        const curr = filterTypes[k];
        (acc as any)[k] = curr?.state ?? null;
        return acc;
      }, {} as FilterStates<FT>),
    [filterTypes]
  );

  const [filters, setFilters] = useState<FilterStates<FT>>(initFilters);

  useEffect(() => {
    setProducts(
      Object.entries(filters)
        .map(([id, p]) => filterTypes[id].processor(p ?? []))
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

      {Object.entries(filters).map(([k, filter]) => {
        const f = filterTypes[k];
        if (!f) return null;
        if (!filter) return null;
        return (
          <f.FilterChip
            value={filter}
            filterType={f}
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
                filters[id] !== null || ft.availability === "disabled-inactive"
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
