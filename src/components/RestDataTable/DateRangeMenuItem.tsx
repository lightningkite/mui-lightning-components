import { Remove } from "@mui/icons-material";
import {
  Divider,
  ListItemButton,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  DialogActions,
  Button,
} from "@mui/material";
import { GridEnrichedColDef } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers";
import React, { FC, useEffect, useState } from "react";

export interface DateRangeFilter {
  field: string;
  start?: Date;
  end?: Date;
}

export interface DateRangeMenuItemProps {
  initialDateRangeFilter: DateRangeFilter;
  saveDateRangeFilter: (dateRange: DateRangeFilter) => void;
  column: GridEnrichedColDef;
}

const DateRangeMenuItem: FC<DateRangeMenuItemProps> = (props) => {
  const { initialDateRangeFilter, saveDateRangeFilter, column } = props;

  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<Omit<DateRangeFilter, "field">>(
    {}
  );

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const isInvalid =
    dateRange.start && dateRange.end && dateRange.start > dateRange.end;

  useEffect(
    () =>
      setDateRange(
        initialDateRangeFilter.field === column.field
          ? initialDateRangeFilter
          : {}
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open]
  );

  return (
    <>
      <Divider />
      <ListItemButton sx={{ py: "6px" }} onClick={handleOpen}>
        Filter Date Range
      </ListItemButton>
      <Dialog open={open}>
        <DialogTitle>
          {column.headerName || column.field}: Filter Date Range
        </DialogTitle>

        <DialogContent>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            divider={<Remove />}
            pt="1rem"
          >
            <DatePicker
              label="Start Date"
              renderInput={(params) => (
                <TextField {...params} sx={{ width: "100%" }} />
              )}
              value={dateRange.start ?? null}
              onChange={(date) => {
                setDateRange({
                  ...dateRange,
                  start: date ? new Date(date) : undefined,
                });
              }}
            />
            <DatePicker
              label="End Date"
              renderInput={(params) => (
                <TextField {...params} sx={{ width: "100%" }} />
              )}
              value={dateRange.end ?? null}
              onChange={(date) => {
                setDateRange({
                  ...dateRange,
                  end: date ? new Date(date) : undefined,
                });
              }}
            />
          </Stack>
          {isInvalid && (
            <Alert severity="error" sx={{ my: 2 }}>
              Start date cannot be after the end date
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              saveDateRangeFilter({ ...dateRange, field: column.field });
              handleClose();
            }}
            disabled={isInvalid}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DateRangeMenuItem;
