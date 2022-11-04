import { Condition } from "@lightningkite/lightning-server-simplified";

/**
 * Returns a lightning server condition that will match any items
 * where any of the search terms occur in any of the fields
 *
 * @param searchTerms an array of search terms
 * @param searchFields the fields to include in the search
 * @returns a lightning server condition
 */
export function makeSearchConditions<T>(
  searchTerms: string[] | undefined,
  searchFields: (keyof T)[] | undefined
): Condition<T>[] {
  const conditions: Condition<T>[] = [];

  searchTerms = searchTerms?.filter((term) => term !== "");

  if (searchTerms?.length && searchFields?.length) {
    const rowConditions: Condition<T>[] = [];

    searchTerms?.forEach((term) => {
      const filterValueConditions: Condition<T>[] = [];

      searchFields.forEach((columnName) => {
        filterValueConditions.push({
          [columnName]: {
            StringContains: {
              value: term,
              ignoreCase: true,
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
