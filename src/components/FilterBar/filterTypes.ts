export type FilterType = "select" | "multiSelect" | "unit";

export type FilterTypeValue<
  T,
  FILTER_TYPE extends FilterType
> = FILTER_TYPE extends "select"
  ? T | null
  : FILTER_TYPE extends "multiSelect"
  ? T[]
  : FILTER_TYPE extends "unit"
  ? true
  : never;

export interface BaseFilterOption<T, FILTER_OPTION extends FilterOption<T>> {
  type: FilterType;
  name: string;
  includeByDefault?: boolean;
  defaultValue?: FilterTypeValue<T, FILTER_OPTION["type"]>;
}

export interface SelectFilterOption<T>
  extends BaseFilterOption<T, SelectFilterOption<T>> {
  type: "select";
  placeholder: string;
  options: T[];
  optionToID?: (option: T) => string;
  optionToLabel?: (option: T) => string;
}

export interface MultiSelectFilterOption<T>
  extends BaseFilterOption<T, MultiSelectFilterOption<T>> {
  type: "multiSelect";
  placeholder: string;
  options: T[];
  optionToID?: (option: T) => string;
  optionToLabel?: (option: T) => string;
}

export interface UnitFilterOption
  extends BaseFilterOption<never, UnitFilterOption> {
  type: "unit";
}

export type FilterOption<T> =
  | SelectFilterOption<T>
  | MultiSelectFilterOption<T>
  | UnitFilterOption;
