import { MenuItem } from "@mui/material";
import { MenuItemDisplayProps } from "./filterUtils";

export type BasicMenuItemDisplayProps<V> = {
  availability?: "hidden" | "disabled-inactive" | "available";
};
export function createBasicMenuItemDisplay<V, P>(
  outerProps: BasicMenuItemDisplayProps<V>
) {
  return function Display(props: MenuItemDisplayProps<V, P>) {
    if (outerProps.availability === "hidden") return null
    return (
      <MenuItem
        key={props.filterType.menuLabel}
        disabled={
          props.menuProps.disabled || outerProps.availability === "disabled-inactive"
        }
        onClick={props.menuProps.onClick}
      >
        {props.filterType.menuLabel}
      </MenuItem>
    );
  };
}
