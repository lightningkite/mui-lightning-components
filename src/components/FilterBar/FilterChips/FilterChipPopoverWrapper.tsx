import {
  Tooltip,
  Chip,
  Typography,
  Popover,
  IconButton,
  Stack,
} from "@mui/material";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import { PropsWithChildren, useState } from "react";
import { FilterChipProps } from "../filterUtils";
import { Close } from "@mui/icons-material";

export function FilterChipPopoverWrapper<V, P>(
  props: PropsWithChildren<
    FilterChipProps<V, P> & { displayValues: (v: V[]) => string }
  >
) {
  const { filterType, value, remove, displayValues, children } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const isActive = value.length > 0;

  return (
    <>
      <Tooltip title={filterType.menuLabel}>
        <Chip
          icon={<ArrowDropDownIcon />}
          color={isActive ? "primary" : "default"}
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
        <Stack>
          <IconButton
            onClick={() => remove()}
            size="small"
            sx={{ alignSelf: "flex-end", mt: 1, mr: 1 }}
          >
            <Close fontSize={"small"} />
          </IconButton>
          {children}
        </Stack>
      </Popover>
    </>
  );
}
