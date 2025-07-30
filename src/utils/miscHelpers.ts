import { Condition } from "@lightningkite/lightning-server-simplified";

/**
 * Returns a lightning server condition that will match any items
 * where any of the search terms occur in any of an objects properties
 *
 * @param searchTerms an array of search terms
 * @param searchProperties non-nullable properties to search
 * @param nullableSearchProperties nullable properties to search
 * @returns a lightning server condition
 */
export function makeSearchConditions<T>(
  searchTerms: string[] | undefined,
  searchProperties: (keyof T)[] | undefined,
  nullableSearchProperties?: (keyof T)[] | undefined
): Condition<T>[] {
  const conditions: Condition<T>[] = [];

  searchTerms = searchTerms?.filter((term) => term !== "");

  if (
    searchTerms?.length &&
    (searchProperties?.length || nullableSearchProperties?.length)
  ) {
    const rowConditions: Condition<T>[] = [];

    searchTerms?.forEach((term) => {
      const filterValueConditions: Condition<T>[] = [];

      searchProperties?.forEach((columnName) => {
        filterValueConditions.push({
          [columnName]: {
            StringContains: {
              value: term,
              ignoreCase: true,
            },
          },
        } as unknown as Condition<T>);
      });

      nullableSearchProperties?.forEach((columnName) => {
        filterValueConditions.push({
          [columnName as keyof T]: {
            IfNotNull: {
              StringContains: {
                value: term,
                ignoreCase: true,
              },
            },
          },
        } as unknown as Condition<T>);
      });

      rowConditions.push({ Or: filterValueConditions });
    });

    conditions.push({ And: rowConditions });
  }

  return conditions;
}
