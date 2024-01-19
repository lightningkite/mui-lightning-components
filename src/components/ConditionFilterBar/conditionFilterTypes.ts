import { Condition, HasId } from "@lightningkite/lightning-server-simplified";

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

export interface ConditionBaseFilterOption<
  T,
  FILTER_OPTION extends FilterOption<T>
> {
  type: FilterType;
  name: string;
  optionToCondition: (
    option: FilterTypeValue<T, FILTER_OPTION["type"]>
  ) => Condition<T>;
  includeByDefault?: boolean;
  defaultValue?: FilterTypeValue<T, FILTER_OPTION["type"]>;
  optionToID?: (option: FilterTypeValue<T, FILTER_OPTION["type"]>) => string;
  optionToLabel?: (option: FilterTypeValue<T, FILTER_OPTION["type"]>) => string;
}

export interface ConSelectFilterOption<T>
  extends ConditionBaseFilterOption<T, ConSelectFilterOption<T>> {
  type: "select";
  placeholder?: string;
  options: T[];
}

export interface ConMultiSelectFilterOption<T>
  extends ConditionBaseFilterOption<T, ConMultiSelectFilterOption<T>> {
  type: "multiSelect";
  placeholder?: string;
  options: T[];
}

export interface ConUnitFilterOption
  extends ConditionBaseFilterOption<never, ConUnitFilterOption> {
  type: "unit";
}

export type FilterOption<T> =
  | ConSelectFilterOption<T>
  | ConMultiSelectFilterOption<T>
  | ConUnitFilterOption;
