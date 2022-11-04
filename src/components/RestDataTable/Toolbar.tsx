import { ArrowDropDown, Close } from "@mui/icons-material";
import { Stack, Button, Menu, MenuItem } from "@mui/material";
import {
  GridSelectionModel,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import HoverHelp from "components/HoverHelp";
import React, { FC, useState } from "react";
import { DateRangeFilter } from "./DateRangeMenuItem";
import { DataTableSelectAction } from "./RestDataTable";

export interface ToolbarProps {
  showQuickFilter: boolean;
  searchHeaderNames: string[];
  selectActions?: DataTableSelectAction[];
  selectionModel: GridSelectionModel;
  dateRangeFilter?: DateRangeFilter;
  setDateRangeFilter: (dateRange: DateRangeFilter | undefined) => void;
}

const RestDataTableToolbar: FC<ToolbarProps> = (props) => {
  const {
    showQuickFilter,
    searchHeaderNames,
    selectActions,
    selectionModel,
    dateRangeFilter,
    setDateRangeFilter,
  } = props;

  const [actionsMenuAnchor, setActionsMenuAnchor] =
    useState<null | HTMLElement>(null);

  return (
    <GridToolbarContainer>
      {(showQuickFilter ||
        dateRangeFilter ||
        (!!selectionModel.length && !!selectActions?.length)) && (
        <Stack
          direction="row"
          width="100%"
          sx={{ px: 1, pt: 1, minHeight: "50px" }}
          alignItems="center"
        >
          {!!selectionModel.length && !!selectActions?.length && (
            <Button
              onClick={(e) => setActionsMenuAnchor(e.currentTarget)}
              endIcon={<ArrowDropDown />}
              // variant="outlined"
              sx={{ mr: 1 }}
            >
              Actions
            </Button>
          )}

          {dateRangeFilter && (
            <Button
              // variant="outlined"
              // size="small"
              onClick={() => setDateRangeFilter(undefined)}
              startIcon={<Close />}
            >
              {(() => {
                if (dateRangeFilter.start && dateRangeFilter.end) {
                  return `${dateRangeFilter.start.toLocaleDateString()} – ${dateRangeFilter.end.toLocaleDateString()}`;
                }
                if (dateRangeFilter.start) {
                  return `From ${dateRangeFilter.start.toLocaleDateString()}`;
                }
                if (dateRangeFilter.end) {
                  return `Through ${dateRangeFilter.end.toLocaleDateString()}`;
                }
              })()}
            </Button>
          )}

          {showQuickFilter && (
            <HoverHelp
              description={`Search by ${searchHeaderNames.join(", ")}`}
              enableWrapper
              sx={{ width: 320, ml: "auto" }}
            >
              <GridToolbarQuickFilter
                debounceMs={300}
                size="medium"
                // helperText={
                //   showSearchHelperText
                //     ? `Search by ${searchHeaderNames.join(", ")}`
                //     : undefined
                // }
                sx={{ width: "100%" }}
              />
            </HoverHelp>
          )}
          {/* <GridToolbarExport
          printOptions={{
            hideFooter: true,
            hideToolbar: true
          }}
        /> */}
        </Stack>
      )}

      <Menu
        id="basic-menu"
        anchorEl={actionsMenuAnchor}
        open={!!actionsMenuAnchor}
        onClose={() => setActionsMenuAnchor(null)}
      >
        {selectActions?.map((action) => (
          <MenuItem
            key={action.label}
            onClick={() => {
              action.action(selectionModel as string[]);
              setActionsMenuAnchor(null);
            }}
          >
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </GridToolbarContainer>
  );
};

export default RestDataTableToolbar;
