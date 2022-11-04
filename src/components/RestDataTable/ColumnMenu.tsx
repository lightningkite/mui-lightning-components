import {
  GridColumnMenuProps,
  GridColumnMenuContainer,
  SortGridMenuItems,
  GridFilterMenuItem
} from "@mui/x-data-grid"
import React, {forwardRef} from "react"
import DateRangeMenuItem, {DateRangeFilter} from "./DateRangeMenuItem"

export interface ColumnMenuProps extends GridColumnMenuProps {
  dateRangeFilter?: DateRangeFilter
  setDateRangeFilter: (dateRange: DateRangeFilter | undefined) => void
}

const ColumnMenu = forwardRef<HTMLUListElement, ColumnMenuProps>(
  function GridColumnMenu(props: ColumnMenuProps, ref) {
    const {hideMenu, currentColumn, dateRangeFilter, setDateRangeFilter} = props

    return (
      <GridColumnMenuContainer ref={ref} {...props}>
        <SortGridMenuItems onClick={hideMenu} column={currentColumn} />
        <GridFilterMenuItem onClick={hideMenu} column={currentColumn} />
        {(props.currentColumn.type === "date" ||
          props.currentColumn.type === "dateTime") && (
          <DateRangeMenuItem
            column={currentColumn}
            initialDateRangeFilter={
              dateRangeFilter?.field === currentColumn.field
                ? dateRangeFilter
                : {field: currentColumn.field}
            }
            saveDateRangeFilter={(filter) =>
              setDateRangeFilter(
                filter.start || filter.end ? filter : undefined
              )
            }
          />
        )}
      </GridColumnMenuContainer>
    )
  }
)

export default ColumnMenu
