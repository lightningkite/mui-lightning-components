import {
  Tooltip,
  Chip,
  Typography,
  Popover,
  IconButton,
  Stack,
} from "@mui/material";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import { PropsWithChildren, useMemo, useState } from "react";
import { FilterChipProps } from "../types";

export function FilterChipPopoverWrapper<V, P>(
  props: PropsWithChildren<
    FilterChipProps<V, P> & { displayValues: (v: V[]) => string }
  >
) {

  const { filterType, value, removeFromBar, displayValues, children } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const isActive = useMemo(() => value.length > 0, [value]);

  return (
    <>
      <Tooltip title={filterType.menuLabel}>
        <Chip
          icon={<ArrowDropDownIcon />}
          color={isActive ? "secondary" : "default"}
          label={
            <Typography
              variant="body2"
              fontStyle={isActive ? undefined : "italic"}
            >
              {value.length > 0 ? displayValues(value) : filterType.menuLabel}
            </Typography>
          }
          clickable
          onClick={(event) => setAnchorEl(event.currentTarget)}
          size="small"
          onDelete={removeFromBar}
        />
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        keepMounted
      >
        <Stack>{children}</Stack>
      </Popover>
    </>
  );
}
