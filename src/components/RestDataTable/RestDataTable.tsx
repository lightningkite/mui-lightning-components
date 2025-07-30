import {
  Condition,
  HasId,
  Query,
  RestEndpoint,
} from "@lightningkite/lightning-server-simplified";
import { Alert, Box, Paper } from "@mui/material";
import {
  ColumnMenuPropsOverrides,
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridRowSelectionModel,
  GridSortModel,
} from "@mui/x-data-grid";
import dayjs from "dayjs";
import React, { ReactElement, useEffect, useMemo, useReducer } from "react";
import CustomColumnMenu, { CustomColumnMenuProps } from "./CustomColumnMenu";
import { DateRangeFilter } from "./DateRangeMenuItem";
import RestDataTableToolbar, {
  DataTableSelectAction,
  ToolbarProps,
} from "./Toolbar";
import { makeSearchConditions } from "utils/miscHelpers";

// For details on configuring the columns prop, see https://mui.com/x/react-data-grid/column-definition/#headers
export interface RestDataTableProps<T extends HasId> {
  restEndpoint: Pick<RestEndpoint<T>, "query" | "count">;
  columns: GridColDef<T>[];
  onRowClick?: (item: T, e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  additionalQueryConditions?: Condition<T>[];
  dependencies?: unknown[];
  searchFields?: (keyof T)[];
  nullableSearchFields?: (keyof T)[];
  defaultSorting?: GridSortModel;
  multiselectActions?: DataTableSelectAction[];
  defaultPageSize?: number;
  pageSizeOptions?: number[];
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
    defaultPageSize = 20,
    pageSizeOptions = [5, 10, 20, 50, 100],
    multiselectActions,

    loading: externalLoading,
  } = props;

  const [state, dispatch] = useReducer(reducer<T>, {
    rows: { status: "loading" },
    dateRangeFilter: undefined,
    gridFilterModel: { items: [] },
    pageSize: defaultPageSize,
    page: 0,
    selectionModel: { ids: new Set<string>(), type: "include" },
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
    CustomColumnMenuProps,
    "dateRangeFilter" | "setDateRangeFilter"
  > = {
    dateRangeFilter,
    setDateRangeFilter: (newFilter) =>
      dispatch({ type: "setDateRangeFilter", dateRangeFilter: newFilter }),
  };

  const queryCondition: Condition<T> = useMemo(() => {
    const conditions = makeQueryConditions(state, props);
    return conditions.length > 0 ? { And: conditions } : { Always: true };
  }, [dateRangeFilter, gridFilterModel, dependencies]);

  useEffect(() => dispatch({ type: "forceReload" }), dependencies);

  useEffect(() => {
    if (rows.status !== "loading" && rows.status !== "changingPage") return;

    const orderBy = sortModel
      .filter((s) => !!s.sort)
      .map((s) => {
        if (s.sort === "desc") return "-" + s.field;
        return s.field;
      }) as Query<T>["orderBy"];

    const totalItems = "totalItems" in rows ? rows.totalItems : undefined;

    Promise.all([
      restEndpoint.query({
        condition: queryCondition,
        skip: page * pageSize,
        limit: pageSize,
        orderBy: [...(orderBy ?? []), "-_id"] as Query<T>["orderBy"],
      }),
      totalItems ?? restEndpoint.count(queryCondition),
    ])
      .then(([items, totalItems]) =>
        dispatch({ type: "setRows", items, totalItems })
      )
      .catch(() => dispatch({ type: "error" }));
  }, [rows.status]);

  const processedColumns = useMemo(() => {
    const temp: GridColDef<T>[] = columns.map((c) => ({
      ...c,
      disableColumnMenu: !(
        c.type === "date" ||
        // c.type === "datetime" ||
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
  }, [columns, multiselectActions]);

  if (rows.status === "error")
    return (
      <Alert severity="error" variant="filled">
        Error loading table items
      </Alert>
    );

  const { rowItems, totalItems } = (() => {
    if (rows.status === "changingPage") {
      return {
        rowItems: rows.previousItems ?? [],
        totalItems: rows.totalItems,
      };
    }
    if (rows.status === "success") {
      return {
        rowItems: rows.items,
        totalItems: rows.totalItems,
      };
    }

    return {
      rowItems: [],
      totalItems: 0,
    };
  })();

  return (
    <div>
      <Box component={Paper}>
        <DataGrid
          rows={rowItems}
          columns={processedColumns}
          rowHeight={60}
          pageSizeOptions={pageSizeOptions}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(newPaginationModel) =>
            dispatch({
              type: "setPaginationModel",
              paginationModel: newPaginationModel,
            })
          }
          autoHeight
          getRowId={(row) => row._id}
          onRowClick={(params, e) => onRowClick && onRowClick(params.row, e)}
          loading={externalLoading || rows.status === "loading"}
          pagination
          paginationMode="server"
          rowCount={totalItems}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={(newSortModel) =>
            dispatch({ type: "setSortModel", sortModel: newSortModel })
          }
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          slots={{
            toolbar: RestDataTableToolbar as any,
            columnMenu: CustomColumnMenu as any,
          }}
          // disableColumnMenu
          filterMode="server"
          filterModel={gridFilterModel}
          onFilterModelChange={(newFilterModel) =>
            dispatch({
              type: "setFilterModel",
              filterModel: newFilterModel,
            })
          }
          // keepNonExistentRowsSelected
          disableRowSelectionOnClick
          checkboxSelection={!!multiselectActions?.length}
          onRowSelectionModelChange={(newSelectionModel) =>
            dispatch({
              type: "setSelectionModel",
              selectionModel: newSelectionModel,
            })
          }
          rowSelectionModel={selectionModel}
          slotProps={{
            toolbar: customToolbarProps,
            columnMenu: customColumnMenuProps as ColumnMenuPropsOverrides,
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
    | { status: "loading" }
    | { status: "changingPage"; previousItems: T[]; totalItems: number }
    | { status: "error" }
    | { status: "success"; items: T[]; totalItems: number };
  dateRangeFilter: DateRangeFilter | undefined;
  gridFilterModel: GridFilterModel;
  pageSize: number;
  page: number;
  selectionModel: GridRowSelectionModel;
  sortModel: GridSortModel;
};

type Actions<T> =
  | { type: "error" }
  | { type: "setRows"; items: T[]; totalItems: number }
  | { type: "setDateRangeFilter"; dateRangeFilter: DateRangeFilter | undefined }
  | { type: "setFilterModel"; filterModel: GridFilterModel }
  | { type: "setPaginationModel"; paginationModel: GridPaginationModel }
  | { type: "setSelectionModel"; selectionModel: GridRowSelectionModel }
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

    case "setFilterModel":
      return {
        ...state,
        rows: { status: "loading" },
        gridFilterModel: action.filterModel,
        page: 0,
      };

    case "setPaginationModel": {
      if (state.pageSize !== action.paginationModel.pageSize) {
        return {
          ...state,
          rows: { status: "loading" },
          pageSize: action.paginationModel.pageSize,
          page: 0,
        };
      } else if (state.page !== action.paginationModel.page) {
        const previousRows =
          state.rows.status === "success" ? state.rows : undefined;

        return {
          ...state,
          rows: {
            status: "changingPage",
            previousItems: previousRows?.items ?? [],
            totalItems: previousRows?.totalItems ?? 0,
          },
          page: action.paginationModel.page,
        };
      }
      return state;
    }

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
