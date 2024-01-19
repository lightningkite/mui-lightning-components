import { Condition, HasId } from "@lightningkite/lightning-server-simplified";

export type ConditionFilterType = "select" | "multiSelect" | "unit";

export type ConditionFilterTypeValue<
  T,
  FILTER_TYPE extends ConditionFilterType
> = FILTER_TYPE extends "select"
  ? T | null
  : FILTER_TYPE extends "multiSelect"
  ? T[]
  : FILTER_TYPE extends "unit"
  ? true
  : never;

export interface ConditionBaseFilterOption<
  T,
  FILTER_OPTION extends ConditionFilterOption<T>
> {
  type: ConditionFilterType;
  name: string;
  valuesToCondition: (
    values: ConditionFilterTypeValue<T, FILTER_OPTION["type"]>
  ) => Condition<T>;
  includeByDefault?: boolean;
  defaultValue?: ConditionFilterTypeValue<T, FILTER_OPTION["type"]>;
  optionToID?: (option: T) => string;
  optionToLabel?: (option: T) => string;
}
``;
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

export type ConditionFilterOption<T> =
  | ConSelectFilterOption<T>
  | ConMultiSelectFilterOption<T>
  | ConUnitFilterOption;
