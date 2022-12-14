import {
  condition,
  Condition,
  HasId,
  Query,
  SessionRestEndpoint,
} from "@lightningkite/lightning-server-simplified";
import { Alert, Box, Paper } from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridColumns,
  GridFilterModel,
  GridSelectionModel,
  GridSortModel,
} from "@mui/x-data-grid";
import dayjs from "dayjs";
import React, { ReactElement, useEffect, useState } from "react";
import ColumnMenu, { ColumnMenuProps } from "./ColumnMenu";
import { DateRangeFilter } from "./DateRangeMenuItem";
import RestDataTableToolbar, {
  DataTableSelectAction,
  ToolbarProps,
} from "./Toolbar";
import { makeSearchConditions } from "utils/miscHelpers";

// For details on configuring the columns prop, see https://v4.mui.com/components/data-grid/columns/#headers
export interface RestDataTableProps<T extends HasId> {
  restEndpoint: SessionRestEndpoint<T>;
  columns: GridColDef<T>[];
  onRowClick?: (item: T) => void;
  additionalQueryConditions?: Condition<T>[];
  dependencies?: unknown[];
  searchFields?: (keyof T)[];
  defaultSorting?: GridSortModel;
  multiselectActions?: DataTableSelectAction[];
  loading?: boolean;
}

export function RestDataTable<T extends HasId>(
  props: RestDataTableProps<T>
): ReactElement | null {
  const {
    onRowClick,
    additionalQueryConditions,
    restEndpoint,
    columns,
    dependencies,
    searchFields,
    defaultSorting = [],
    multiselectActions,
    loading: externalLoading,
  } = props;

  const [items, setItems] = useState<T[] | null>();
  const [totalItems, setTotalItems] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [sortModel, setSortModel] = useState<GridSortModel>(defaultSorting);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>();
  const [queryCondition, setQueryCondition] = useState<Condition<T>>();
  const [selectionModel, setSelectionModel] = useState<GridSelectionModel>([]);

  const customToolbarProps: ToolbarProps = {
    selectActions: multiselectActions,
    selectionModel,
    showQuickFilter: !!searchFields?.length,
    dateRangeFilter,
    setDateRangeFilter,
    searchHeaderNames: (() => {
      const searchFieldstrings = searchFields?.map((c) => c.toString()) || [];
      return columns
        .filter((c) => searchFieldstrings.includes(c.field))
        .map((c) => c.headerName?.toLowerCase())
        .filter((name) => name !== undefined) as string[];
    })(),
  };

  const customColumnMenuProps: Pick<
    ColumnMenuProps,
    "dateRangeFilter" | "setDateRangeFilter"
  > = {
    dateRangeFilter,
    setDateRangeFilter,
  };

  useEffect(() => {
    const conditions = [
      ...(additionalQueryConditions || []),
      ...makeSearchConditions(filterModel.quickFilterValues, searchFields),
    ];

    if (dateRangeFilter) {
      const usesTime =
        columns.find((c) => c.field === dateRangeFilter.field)?.type ===
        "dateTime";

      const startDate = dateRangeFilter.start;
      let endDate = dateRangeFilter.end;

      // if (usesTime && endDate) {
      endDate = dayjs(endDate).add(1, "day").toDate();
      // }

      const startTimeString = startDate?.toISOString();
      const endTimeString = endDate?.toISOString();

      if (startTimeString) {
        conditions.push({
          [dateRangeFilter.field]: {
            GreaterThanOrEqual: !usesTime
              ? startTimeString.split("T")[0]
              : startTimeString,
          },
        } as Condition<T>);
      }

      if (endTimeString) {
        conditions.push({
          [dateRangeFilter.field]: {
            LessThanOrEqual: !usesTime
              ? endTimeString.split("T")[0]
              : endTimeString,
          },
        } as Condition<T>);
      }
    }

    setQueryCondition(
      conditions.length ? { And: conditions } : { Always: true }
    );
  }, [
    additionalQueryConditions,
    filterModel,
    searchFields,
    dateRangeFilter,
    dependencies,
    columns,
  ]);

  useEffect(() => {
    setPage(0);
    queryCondition && restEndpoint.count(queryCondition).then(setTotalItems);
  }, [restEndpoint, queryCondition]);

  useEffect(() => {
    if (!queryCondition) return;
    setLoading(true);

    const orderBy = sortModel
      .filter((s) => !!s.sort)
      .map((s) => {
        if (s.sort === "desc") return "-" + s.field;
        return s.field;
      }) as Query<T>["orderBy"];

    restEndpoint
      .query({
        condition: queryCondition,
        skip: page * pageSize,
        limit: pageSize,
        orderBy: orderBy?.length ? orderBy : undefined,
      })
      .then(setItems)
      .catch(() => setItems(null))
      .finally(() => setLoading(false));
  }, [restEndpoint, page, pageSize, queryCondition, sortModel]);

  const processedColumns = (() => {
    const temp: GridColumns<T> = columns.map((c) => ({
      ...c,
      disableColumnMenu: !(
        c.type === "date" ||
        c.type === "datetime" ||
        c.sortable !== false
      ),
    }));

    if (multiselectActions?.length) {
      temp.push({
        field: "actions",
        type: "actions",
        width: 80,
        getActions: (params) =>
          multiselectActions?.map((action) => (
            <GridActionsCellItem
              key={action.label}
              icon={action.icon}
              label={action.label}
              onClick={() => action.action([params.id as string])}
              showInMenu
            />
          )) ?? [],
      });
    }

    return temp;
  })();

  if (items === null)
    return (
      <Alert severity="error" variant="filled">
        Error loading table items
      </Alert>
    );

  return (
    <div>
      <Box component={Paper}>
        <DataGrid
          rows={items ?? []}
          columns={processedColumns}
          rowHeight={60}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          onPageSizeChange={setPageSize}
          page={page}
          onPageChange={setPage}
          autoHeight
          getRowId={(row) => row._id}
          onRowClick={(params) => onRowClick && onRowClick(params.row)}
          loading={externalLoading || loading || totalItems === undefined}
          pagination
          paginationMode="server"
          rowCount={totalItems ?? items?.length ?? 0}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          components={{
            Toolbar: RestDataTableToolbar,
            ColumnMenu: ColumnMenu,
          }}
          // disableColumnMenu
          filterMode="server"
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          // keepNonExistentRowsSelected
          disableSelectionOnClick
          checkboxSelection={!!multiselectActions?.length}
          onSelectionModelChange={(newSelectionModel) => {
            setSelectionModel(newSelectionModel);
          }}
          selectionModel={selectionModel}
          componentsProps={{
            toolbar: customToolbarProps,
            columnMenu: customColumnMenuProps,
          }}
          sx={{
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
            },
            "& .MuiDataGrid-row:active": {
              backgroundColor: onRowClick
                ? "rgba(0, 0, 0, 0.1) !important"
                : undefined,
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: onRowClick ? "rgba(0, 0, 0, 0.04)" : "unset",
            },
            "& .MuiDataGrid-row.Mui-selected": {
              backgroundColor: "rgb(236, 240, 243)",
            },
            "& .MuiDataGrid-row.Mui-selected:hover": {
              backgroundColor: "rgb(236, 240, 243)",
            },
            "& .MuiDataGrid-row": {
              cursor: onRowClick ? "pointer" : undefined,
            },
            "& .MuiDataGrid-cell, .MuiDataGrid-columnHeader": {
              outline: "none !important",
            },
          }}
        />
      </Box>
    </div>
  );
}
