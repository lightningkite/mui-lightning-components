import {
  Condition,
  HasId,
  Query,
  SessionRestEndpoint,
} from "@lightningkite/lightning-server-simplified";
import { Alert, Box, Paper } from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridEnrichedColDef,
  GridColumns,
  GridFilterModel,
  GridSelectionModel,
  GridSortModel,
} from "@mui/x-data-grid";
import dayjs from "dayjs";
import React, { ReactElement, useEffect, useMemo, useReducer } from "react";
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
  columns: GridEnrichedColDef<T>[];
  onRowClick?: (item: T) => void;
  additionalQueryConditions?: Condition<T>[];
  dependencies?: unknown[];
  searchFields?: (keyof T)[];
  nullableSearchFields?: (keyof T)[];
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
    nullableSearchFields,
    defaultSorting = [],
    multiselectActions,
    loading: externalLoading,
  } = props;

  const [state, dispatch] = useReducer(reducer<T>, {
    rows: { status: "loading" },
    dateRangeFilter: undefined,
    gridFilterModel: { items: [] },
    pageSize: 10,
    page: 0,
    selectionModel: [],
    sortModel: defaultSorting,
  });

  const {
    rows,
    dateRangeFilter,
    gridFilterModel,
    pageSize,
    page,
    selectionModel,
    sortModel,
  } = state;

  const customToolbarProps: ToolbarProps = {
    selectActions: multiselectActions,
    selectionModel,
    showQuickFilter: !!searchFields?.length || !!nullableSearchFields?.length,
    dateRangeFilter,
    setDateRangeFilter: (newFilter) =>
      dispatch({ type: "setDateRangeFilter", dateRangeFilter: newFilter }),
    searchHeaderNames: (() => {
      const searchFieldStrings = searchFields?.map((c) => c.toString()) || [];
      const nullableSearchFieldString =
        nullableSearchFields?.map((c) => c.toString()) || [];
      return columns
        .filter(
          (c) =>
            searchFieldStrings.includes(c.field) ||
            nullableSearchFieldString.includes(c.field)
        )
        .map((c) => c.headerName?.toLowerCase())
        .filter((name) => name !== undefined) as string[];
    })(),
  };

  const customColumnMenuProps: Pick<
    ColumnMenuProps,
    "dateRangeFilter" | "setDateRangeFilter"
  > = {
    dateRangeFilter,
    setDateRangeFilter: (newFilter) =>
      dispatch({ type: "setDateRangeFilter", dateRangeFilter: newFilter }),
  };

  const queryCondition: Condition<T> = useMemo(() => {
    const conditions = makeQueryConditions(state, props);
    return conditions.length === 0 ? { And: conditions } : { Always: true };
  }, [dateRangeFilter, gridFilterModel]);

  useEffect(() => dispatch({ type: "forceReload" }), dependencies);

  useEffect(() => {
    if (rows.status !== "loading") return;

    const orderBy = sortModel
      .filter((s) => !!s.sort)
      .map((s) => {
        if (s.sort === "desc") return "-" + s.field;
        return s.field;
      }) as Query<T>["orderBy"];

    Promise.all([
      restEndpoint.query({
        condition: queryCondition,
        skip: page * pageSize,
        limit: pageSize,
        orderBy: [...(orderBy ?? []), "-_id"] as Query<T>["orderBy"],
      }),
      restEndpoint.count(queryCondition),
    ])
      .then(([items, totalItems]) =>
        dispatch({ type: "setRows", items, totalItems })
      )
      .catch(() => dispatch({ type: "error" }));
  }, [rows.status]);

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

  if (rows.status === "error")
    return (
      <Alert severity="error" variant="filled">
        Error loading table items
      </Alert>
    );

  const rowItems =
    rows.status === "loading" ? rows.previousItems ?? [] : rows.items;
  const totalItems = rows.status === "loading" ? undefined : rows.totalItems;

  return (
    <div>
      <Box component={Paper}>
        <DataGrid
          rows={rowItems}
          columns={processedColumns}
          rowHeight={60}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          onPageSizeChange={(newPageSize) =>
            dispatch({ type: "setPageSize", pageSize: newPageSize })
          }
          page={page}
          onPageChange={(newPage) =>
            dispatch({ type: "setPage", page: newPage })
          }
          autoHeight
          getRowId={(row) => row._id}
          onRowClick={(params) => onRowClick && onRowClick(params.row)}
          loading={externalLoading || rows.status === "loading"}
          pagination
          paginationMode="server"
          rowCount={totalItems ?? 0}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={(newSortModel) =>
            dispatch({ type: "setSortModel", sortModel: newSortModel })
          }
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          components={{
            Toolbar: RestDataTableToolbar,
            ColumnMenu: ColumnMenu,
          }}
          // disableColumnMenu
          filterMode="server"
          filterModel={gridFilterModel}
          onFilterModelChange={(newFilterModel) =>
            dispatch({
              type: "setGridFilterModel",
              gridFilterModel: newFilterModel,
            })
          }
          // keepNonExistentRowsSelected
          disableSelectionOnClick
          checkboxSelection={!!multiselectActions?.length}
          onSelectionModelChange={(newSelectionModel) =>
            dispatch({
              type: "setSelectionModel",
              selectionModel: newSelectionModel,
            })
          }
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

type State<T> = {
  rows:
    | { status: "loading"; previousItems?: T[] }
    | { status: "error" }
    | { status: "success"; items: T[]; totalItems: number };
  dateRangeFilter: DateRangeFilter | undefined;
  gridFilterModel: GridFilterModel;
  pageSize: number;
  page: number;
  selectionModel: GridSelectionModel;
  sortModel: GridSortModel;
};

type Actions<T> =
  | { type: "error" }
  | { type: "setRows"; items: T[]; totalItems: number }
  | { type: "setDateRangeFilter"; dateRangeFilter: DateRangeFilter | undefined }
  | { type: "setGridFilterModel"; gridFilterModel: GridFilterModel }
  | { type: "setPageSize"; pageSize: number }
  | { type: "setPage"; page: number }
  | { type: "setSelectionModel"; selectionModel: GridSelectionModel }
  | { type: "setSortModel"; sortModel: GridSortModel }
  | { type: "forceReload" };

function reducer<T>(state: State<T>, action: Actions<T>): State<T> {
  switch (action.type) {
    case "error":
      return {
        ...state,
        rows: { status: "error" },
      };
    case "setRows":
      return {
        ...state,
        rows: {
          status: "success",
          items: action.items,
          totalItems: action.totalItems,
        },
      };
    case "setDateRangeFilter":
      return {
        ...state,
        rows: { status: "loading" },
        dateRangeFilter: action.dateRangeFilter,
        page: 0,
      };
    case "setGridFilterModel":
      return {
        ...state,
        rows: { status: "loading" },
        gridFilterModel: action.gridFilterModel,
        page: 0,
      };
    case "setPageSize":
      return {
        ...state,
        rows: { status: "loading" },
        pageSize: action.pageSize,
        page: 0,
      };
    case "setPage":
      const previousItems =
        state.rows.status === "success" ? state.rows.items : [];

      return {
        ...state,
        rows: { status: "loading", previousItems },
        page: action.page,
      };
    case "setSelectionModel":
      return {
        ...state,
        selectionModel: action.selectionModel,
      };
    case "setSortModel":
      return {
        ...state,
        rows: { status: "loading" },
        sortModel: action.sortModel,
        page: 0,
      };
    case "forceReload":
      return {
        ...state,
        rows: { status: "loading" },
        page: 0,
      };
  }
}

function makeQueryConditions<T extends HasId>(
  state: State<T>,
  props: RestDataTableProps<T>
) {
  const { dateRangeFilter, gridFilterModel } = state;
  const {
    columns,
    additionalQueryConditions,
    searchFields,
    nullableSearchFields,
  } = props;

  const conditions = [
    ...(additionalQueryConditions || []),
    ...makeSearchConditions(
      gridFilterModel.quickFilterValues,
      searchFields,
      nullableSearchFields
    ),
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

  return conditions;
}
