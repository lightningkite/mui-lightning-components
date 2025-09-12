import { Condition } from "@lightningkite/lightning-server-simplified";
import { Predicate } from "../../utils/types";
import { Dispatch, SetStateAction } from "react";

export function genericFilterLabel<T>(toString?: (item: T) => string) {
  return (items: T[]) => {
    const strings = toString ? items.map(toString) : (items as string[]);
    if (strings.length > 2) {
      return `${strings[0]}, ${strings[1]}, and ${strings.length - 2} more`;
    }
    return strings.join(", ");
  };
}

export type LogicOperator = "And" | "Or";

/* Creates a condition based on a filter product that has all products of type `Condition<T>` */
export const objectOfFiltersToCondition = <T>(
  filterProduct: Record<string, Condition<T> | null>,
  operator: LogicOperator = "And"
): Condition<T> => {
  const list = Object.values(filterProduct)
    .map((v) => v)
    .filter((x) => !!x);
  if (operator === "And") {
    return { And: list };
  } else {
    return { Or: list };
  }
};

/* Short-cut for setting a filter given that the product is a Condition<T> */
export const setConditionProduct =
  <T>(setFilter: (condition: Condition<T>) => void) =>
  (obj: Record<string, Condition<T> | null>) =>
    setFilter(objectOfFiltersToCondition(obj));

/* Creates a predicate function based on a filter product that has all products of type `Predicate<T>` */
export const objectOfFiltersToPredicateFun = <T>(
  filterProduct: Record<string, Predicate<T> | null>,
  operator: LogicOperator = "And"
): Predicate<T> => {
  const functions = Object.values(filterProduct)
    .map((v) => v)
    .filter((x) => !!x);
  if (operator === "And") {
    return (item: T) => functions.every((f) => f(item));
  } else {
    return (item: T) => functions.some((f) => f(item));
  }
};

/* Short-cut for setting a filter given that the product is a Predicate<T> */
export function combineAndPredicates<T>(
  setter: Dispatch<SetStateAction<Predicate<T>>>
): (obj: Record<string, Predicate<T> | null>) => void {
  return (predicates) =>
    setter(() => objectOfFiltersToPredicateFun(predicates, "And"));
}
