import { Condition, HasId } from "@lightningkite/lightning-server-simplified";

export type FilterType = "select" | "multiSelect" | "unit";

export type FilterTypeValue<
  T extends HasId,
  FILTER_TYPE extends FilterType
> = FILTER_TYPE extends "select"
  ? T | null
  : FILTER_TYPE extends "multiSelect"
  ? T[]
  : FILTER_TYPE extends "unit"
  ? true
  : never;

export interface ConditionBaseFilterOption<
  T extends HasId,
  FILTER_OPTION extends FilterOption<T>
> {
  type: FilterType;
  name: string;
  includeByDefault?: boolean;
  defaultValue?: FilterTypeValue<T, FILTER_OPTION["type"]>;
  optionToCondition: (
    option: FilterTypeValue<T, FILTER_OPTION["type"]>
  ) => Condition<T>;
}

export interface SelectFilterOption<T extends HasId>
  extends ConditionBaseFilterOption<T, SelectFilterOption<T>> {
  type: "select";
  placeholder?: string;
  options: T[];
  optionToID: (option: T) => string;
  optionToLabel: (option: T) => string;
}

export interface MultiSelectFilterOption<T extends HasId>
  extends ConditionBaseFilterOption<T, MultiSelectFilterOption<T>> {
  type: "multiSelect";
  placeholder?: string;
  options: T[];
  optionToID: (option: T) => string;
  optionToLabel: (option: T) => string;
}

export interface UnitFilterOption
  extends ConditionBaseFilterOption<never, UnitFilterOption> {
  type: "unit";
}

export type FilterOption<T extends HasId> =
  | SelectFilterOption<T>
  | MultiSelectFilterOption<T>
  | UnitFilterOption;
