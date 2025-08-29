import {
  Condition,
  HasId,
  Query,
  SortPart,
} from "@lightningkite/lightning-server-simplified";
import { Alert, Box, Paper } from "@mui/material";
import {
  DataGrid,
  DataGridProps,
  GridActionsCellItem,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridRowSelectionModel,
  GridSortModel,
} from "@mui/x-data-grid";
import {
  DependencyList,
  ReactElement,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import CustomColumnMenu from "./CustomColumnMenu";
import RestDataTableToolbar, {
  DataTableSelectAction,
  ToolbarProps,
} from "./Toolbar";
import { makeSearchConditions } from "utils/miscHelpers";
import { useActiveEffect } from "utils/useActiveEffect";

export interface GetRowsParams<I extends HasId> {
  searchCondition: Condition<I>;
  orderBy?: SortPart<I>[];
}

export interface PageGetterParams {
  skip: number;
  limit: number;
}

export type PageGetter<I> = (params: PageGetterParams) => Promise<I[]>;

export type GetRows<I extends HasId, R> = (params: GetRowsParams<I>) => {
  getCount: (c: Condition<I>) => Promise<number>; // Passing the condition back in makes this easier for actions
  pageGetter: PageGetter<R>;
  condition: Condition<I>;
};

// For details on configuring the columns prop, see https://mui.com/x/react-data-grid/column-definition/#headers
export interface RestDataTableProps<T extends HasId, A extends HasId = T> {
  getRows: GetRows<T, A>;
  columns: GridColDef<A>[];
  onRowClick?: (item: T) => void;
  dependencies?: DependencyList;
  searchFields?: (keyof T)[];
  nullableSearchFields?: (keyof T)[];
  defaultSorting?: GridSortModel;
  multiselectActions?: DataTableSelectAction[];
  defaultPageSize?: number;
  dataGridProps?: Partial<DataGridProps<A>>;
}

export function RestDataTable<T extends HasId, A extends HasId>(
  props: RestDataTableProps<T, A>
): ReactElement | null {
  const {
    onRowClick,
    getRows,
    columns,
    dependencies,
    searchFields,
    nullableSearchFields,
    defaultSorting = [],
    defaultPageSize = 20,
    multiselectActions,
    dataGridProps,
  } = props;

  const [state, dispatch] = useReducer(reducer<A>, {
    rows: { status: "loading" },
    gridFilterModel: { items: [] },
    pageSize: defaultPageSize,
    page: 0,
    selectionModel: { ids: new Set<string>(), type: "include" },
    sortModel: defaultSorting,
  });

  const { rows, gridFilterModel, pageSize, page, selectionModel, sortModel } =
    state;

  const customToolbarProps: ToolbarProps = {
    selectActions: multiselectActions,
    selectionModel,
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

  const queryCondition: Condition<T> = useMemo(
    () => ({
      And: [
        ...makeSearchConditions(
          gridFilterModel.quickFilterValues,
          searchFields,
          nullableSearchFields
        ),
      ],
    }),
    [gridFilterModel, dependencies]
  );

  useEffect(() => dispatch({ type: "forceReload" }), dependencies);

  useActiveEffect(
    (getActive) => {
      const orderBy = sortModel
        .filter((s) => !!s.sort)
        .map((s) => {
          if (s.sort === "desc") return "-" + s.field;
          return s.field;
        }) as Query<T>["orderBy"];

      const totalItems = "totalItems" in rows ? rows.totalItems : undefined;

      const getter = getRows({
        orderBy: [...(orderBy ?? []), "-_id"],
        searchCondition: queryCondition,
      });
      Promise.all([
        getter.pageGetter({ skip: page * pageSize, limit: pageSize }),
        totalItems ?? getter.getCount(queryCondition),
      ])
        .then(([items, totalItems]) => {
          if (getActive()) {
            dispatch({
              type: "setRows",
              items: items as unknown as A[],
              totalItems,
            });
          }
        })
        .catch(() => dispatch({ type: "error" }));
    },
    [rows.status, queryCondition]
  );

  const processedColumns = useMemo(() => {
    const temp: GridColDef<A>[] = columns.map((c) => ({
      ...c,
      disableColumnMenu: !(
        c.type === "date" ||
        c.type === "dateTime" ||
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
          pageSizeOptions={[5, 10, 20, 50, 100]}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(newPaginationModel) =>
            dispatch({
              type: "setPaginationModel",
              paginationModel: newPaginationModel,
            })
          }
          getRowId={(row) => row._id}
          onRowClick={(params) => onRowClick?.(params.row)}
          loading={rows.status === "loading"}
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
          showToolbar
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
          {...dataGridProps}
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
  gridFilterModel: GridFilterModel;
  pageSize: number;
  page: number;
  selectionModel: GridRowSelectionModel;
  sortModel: GridSortModel;
};

type Actions<T> =
  | { type: "error" }
  | { type: "setRows"; items: T[]; totalItems: number }
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
