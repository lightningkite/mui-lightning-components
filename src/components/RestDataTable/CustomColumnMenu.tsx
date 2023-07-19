import {
  GridColumnMenuProps,
  GridColumnMenuContainer,
  GridColumnMenuSortItem,
  GridColumnMenuFilterItem,
} from "@mui/x-data-grid";
import React, { forwardRef } from "react";
import DateRangeMenuItem, { DateRangeFilter } from "./DateRangeMenuItem";

export interface CustomColumnMenuProps extends GridColumnMenuProps {
  dateRangeFilter?: DateRangeFilter;
  setDateRangeFilter: (dateRange: DateRangeFilter | undefined) => void;
}

const CustomColumnMenu = forwardRef<HTMLUListElement, CustomColumnMenuProps>(
  function GridColumnMenu(props: CustomColumnMenuProps, ref) {
    const { hideMenu, colDef, dateRangeFilter, setDateRangeFilter } = props;

    return (
      <GridColumnMenuContainer ref={ref} {...props}>
        <GridColumnMenuSortItem onClick={hideMenu} colDef={colDef} />
        <GridColumnMenuFilterItem onClick={hideMenu} colDef={colDef} />
        {(colDef.type === "date" || colDef.type === "dateTime") && (
          <DateRangeMenuItem
            column={colDef}
            initialDateRangeFilter={
              dateRangeFilter?.field === colDef.field
                ? dateRangeFilter
                : { field: colDef.field }
            }
            saveDateRangeFilter={(filter) =>
              setDateRangeFilter(
                filter.start || filter.end ? filter : undefined
              )
            }
          />
        )}
      </GridColumnMenuContainer>
    );
  }
);

export default CustomColumnMenu;
