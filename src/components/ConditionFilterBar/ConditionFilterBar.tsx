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
import { ConditionFilterChip } from "./ConditionFilterChip";
import {
  ConditionFilterOption,
  ConditionFilterType,
  ConditionFilterTypeValue,
} from "./conditionFilterTypes";
import { Condition, HasId } from "@lightningkite/lightning-server-simplified";

export interface ConditionFilterBarProps<T extends HasId> {
  sx?: SxProps;
  filterOptions: ConditionFilterOption<any>[];
  onActiveFiltersChange: (conditions: Condition<T>[]) => void;
  activeChipColor?: "primary" | "secondary";
}

export interface ConditionActiveFilter<
  T extends HasId,
  FILTER_OPTION extends ConditionFilterOption<T>
> {
  id: string;
  filterOption: FILTER_OPTION;
  value: ConditionFilterTypeValue<T, FILTER_OPTION["type"]>;
}

const filterOptionInitialValues: {
  [F in ConditionFilterType]: ConditionFilterTypeValue<any, F>;
} = {
  select: null,
  multiSelect: [],
  unit: true,
};

export function ConditionFilterBar<T extends HasId>(
  props: ConditionFilterBarProps<T>
): ReactElement {
  const {
    sx,
    filterOptions,
    onActiveFiltersChange,
    activeChipColor = "primary",
  } = props;

  const [activeFilters, setActiveFilters] = useState<
    ConditionActiveFilter<any, ConditionFilterOption<any>>[]
  >(
    filterOptions
      .filter((f) => f.includeByDefault === true)
      .map((filterOption) => ({
        id: crypto.randomUUID(),
        value:
          filterOption.defaultValue ??
          filterOptionInitialValues[filterOption.type],
        filterOption,
      }))
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  function filterToCondition<T>(
    activeFilters: ConditionActiveFilter<any, ConditionFilterOption<any>>[]
  ): Condition<T>[] {
    return activeFilters.reduce<Condition<T>[]>((acc, curr) => {
      if (Array.isArray(curr.value)) {
        curr.value.forEach((v) => {
          acc.push(curr.filterOption.valuesToCondition(v));
        });
      } else {
        acc.push(curr.filterOption.valuesToCondition(curr.value));
      }
      return acc;
    }, []);
  }

  useEffect(
    () => onActiveFiltersChange(filterToCondition(activeFilters)),
    [activeFilters]
  );

  return (
    <Paper
      component={Stack}
      direction="row"
      alignItems="center"
      gap={1}
      flexWrap="wrap"
      sx={{ py: 0.5, px: 1, ...sx }}
    >
      <Typography variant="body2">Filters:</Typography>
      {activeFilters.length === 0 && (
        <Typography variant="body2" color="grey" fontStyle="italic">
          None
        </Typography>
      )}
      {activeFilters.map((af) => (
        <ConditionFilterChip<T, ConditionFilterOption<any>>
          key={af.id}
          activeFilter={af}
          setActiveFilter={(newFilter) => {
            setActiveFilters(
              activeFilters.map((af) =>
                af.id === newFilter.id ? newFilter : af
              )
            );
          }}
          handleDelete={(chipToDelete) => () => {
            setActiveFilters(
              activeFilters.filter((af) => af.id !== chipToDelete.id)
            );
          }}
          activeColor={activeChipColor}
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
                (af) => af.filterOption.name === filterOption.name
              )}
              onClick={() => {
                setActiveFilters([
                  ...activeFilters,
                  {
                    id: crypto.randomUUID(),
                    value:
                      filterOption.defaultValue ??
                      filterOptionInitialValues[filterOption.type],
                    filterOption,
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
