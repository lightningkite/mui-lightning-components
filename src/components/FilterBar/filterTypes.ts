export enum FilterType {
  SELECT = "select",
  MULTI_SELECT = "multiSelect",
  UNIT = "unit",
}

export interface BaseFilterOption {
  type: FilterType;
  name: string;
}

export interface SelectFilterOption<T> extends BaseFilterOption {
  type: FilterType.SELECT;
  placeholder: string;
  options: T[];
  optionToID: (option: T) => string;
  optionToLabel: (option: T) => string;
}

export interface MultiSelectFilterOption<T> extends BaseFilterOption {
  type: FilterType.MULTI_SELECT;
  placeholder: string;
  options: T[];
  optionToID: (option: T) => string;
  optionToLabel: (option: T) => string;
}

export interface UnitFilterOption extends BaseFilterOption {
  type: FilterType.UNIT;
}

export type FilterOption<T> =
  | SelectFilterOption<T>
  | MultiSelectFilterOption<T>
  | UnitFilterOption;
