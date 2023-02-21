export enum FilterType {
  SELECT = "select",
  MULTI_SELECT = "multiSelect",
  UNIT = "unit",
}

export type FilterTypeValue<
  T,
  FILTER_TYPE extends FilterType
> = FILTER_TYPE extends FilterType.SELECT
  ? T | null
  : FILTER_TYPE extends FilterType.MULTI_SELECT
  ? T[]
  : FILTER_TYPE extends FilterType.UNIT
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
  type: FilterType.SELECT;
  placeholder: string;
  options: T[];
  optionToID: (option: T) => string;
  optionToLabel: (option: T) => string;
}

export interface MultiSelectFilterOption<T>
  extends BaseFilterOption<T, MultiSelectFilterOption<T>> {
  type: FilterType.MULTI_SELECT;
  placeholder: string;
  options: T[];
  optionToID: (option: T) => string;
  optionToLabel: (option: T) => string;
}

export interface UnitFilterOption
  extends BaseFilterOption<never, UnitFilterOption> {
  type: FilterType.UNIT;
}

export type FilterOption<T> =
  | SelectFilterOption<T>
  | MultiSelectFilterOption<T>
  | UnitFilterOption;
