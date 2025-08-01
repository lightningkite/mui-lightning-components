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
import React, { FC, useEffect, useState } from "react";

type InitialState = "excluded" | "included" | "required";

export type FilterChipProps2<V, P> = {
  value: V[];
  setValue: (v: V[]) => void;
  remove: () => void;
  filterType: FilterType2<V, P>;
};

export type FilterType2<V = any, P = any> = {
  processor: (v: V[]) => P;
  FilterChip: FC<FilterChipProps2<V, P>>;
  menuLabel: string;
  initialValue?: V[];
  display?: {
    init: InitialState;
    shown?: boolean;
    disabled?: boolean;
  };
  valueToLabel: (v: V[]) => string;
};

type ActiveFilter<V> = {
  id: number;
  value: V;
};

export const FilterBar2 = <FT extends FilterType2[]>(props: {
  filterTypes: FT;
  setProducts: (
    products: ReturnType<FT[number]["processor"]>[]
  ) => void;
}): React.ReactNode => {
  const { filterTypes, setProducts } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [filters, setFilters] = useState<ActiveFilter<any>[]>([]);

  useEffect(() => {
    setProducts(
      filters.map((p) => filterTypes[p.id].processor(p.value))
    );
  }, [filters]);

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
      {filters.length === 0 && (
        <Typography variant="body2" color="grey" fontStyle="italic">
          None
        </Typography>
      )}

      {filters.map((filter, id) => {
        const f = filterTypes[filter.id];
        return (
          <f.FilterChip
            value={filter.value}
            filterType={f}
            setValue={(value) =>
              setFilters(
                filters.map((it, i) =>
                  i !== id ? it : { ...it, value: value }
                )
              )
            }
            remove={() => {
              setFilters(filters.filter((it) => it.id !== filter.id));
            }}
            key={filter.id}
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
        {filterTypes.map(
          ({ menuLabel, display, initialValue }, id) => (
            <MenuItem
              key={id}
              disabled={
                filters.some((it) => it.id === id) || display?.disabled
              }
              onClick={() => {
                setFilters((prev) => [
                  ...prev,
                  { id, value: initialValue ?? [] },
                ]);
                setAnchorEl(null);
              }}
            >
              {menuLabel}
            </MenuItem>
          )
        )}
      </Menu>
    </Paper>
  );
};
