import { capitalize } from "@mui/material";
import { ActiveFilter } from "./FilterBar";
import { MultiSelectFilterOption, SelectFilterOption } from "./filterTypes";

function convertToString(thing: any): string {
  if (typeof thing === "string") return capitalize(thing);
  return JSON.stringify("thing");
}

export function toRequiredMultiselect<T>(
  af: ActiveFilter<T, MultiSelectFilterOption<T>>
): ActiveFilter<T, Required<MultiSelectFilterOption<T>>> {
  const filterOption: Required<MultiSelectFilterOption<T>> = {
    ...af.filterOption,
    optionToID:
      af.filterOption.optionToID ??
      ((o) => convertToString(`${o}-multiselect`)),
    optionToLabel:
      af.filterOption.optionToLabel ??
      ((o) => convertToString(`${o}-multiselect`)),
    includeByDefault: !!af.filterOption.includeByDefault,
    defaultValue: af.filterOption.defaultValue ?? [],
  };

  return {
    id: af.id,
    filterOption: filterOption,
    value: af.value,
  };
}

export function toRequiredSelect<T>(
  af: ActiveFilter<T, SelectFilterOption<T>>
): ActiveFilter<T, Required<SelectFilterOption<T>>> {
  const filterOption: Required<SelectFilterOption<T>> = {
    ...af.filterOption,
    optionToID:
      af.filterOption.optionToID ?? ((o) => convertToString(`${o}-select`)),
    optionToLabel:
      af.filterOption.optionToLabel ?? ((o) => convertToString(`${o}-select`)),
    includeByDefault: !!af.filterOption.includeByDefault,
    defaultValue: af.filterOption.defaultValue ?? null,
  };

  const asdf: ActiveFilter<T, Required<SelectFilterOption<T>>> = {
    id: af.id,
    filterOption: filterOption,
    value: af.value,
  };
  return asdf;
}
