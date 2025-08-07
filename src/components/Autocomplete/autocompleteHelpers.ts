import {
  Condition,
  HasId,
  Query,
  SortPart,
} from "@lightningkite/lightning-server-simplified";

export function wrapIfNotNull<I>(
  runCheck: boolean | undefined,
  condition: Condition<I>
): Condition<I> {
  return runCheck ? ({ IfNotNull: condition } as Condition<I>) : condition;
}

export function conditionFromField<I extends object>(
  field: keyof I,
  condition: Condition<unknown>
): Condition<I> {
  if (typeof field !== "string") return { Always: true };

  const isNullable = field.endsWith("?");
  const fixedField = isNullable ? field.slice(0, -1) : field;

  return wrapIfNotNull(isNullable, { [fixedField]: condition });
}

function conditionFromSearchFields<O extends HasId>(
  searchFields: (keyof O)[],
  input: string
): Condition<O> {
  return {
    Or: searchFields.map((searchField) =>
      conditionFromField<O>(searchField, {
        And: input
          .trim()
          .split(/\s+/)
          .map((term) => ({
            StringContains: { value: term, ignoreCase: true },
          })),
      })
    ),
  };
}

interface FromQueryBaseParams<I extends HasId> {
  getOptions: (query: Query<I>) => Promise<I[]>;
  searchFields: (keyof I)[];
  condition?: Condition<I>;
  orderBy?: SortPart<I>[];
  limit?: number;
}

type GetOptions<T> = (searchText: string) => Promise<T[]>;

export function getOptionsFromQuery<I extends HasId, Out = I>(
  params: FromQueryBaseParams<I> & { then: (items: I[]) => Promise<Out[]> }
): GetOptions<Out>;

export function getOptionsFromQuery<I extends HasId>(
  params: FromQueryBaseParams<I>
): GetOptions<I>;

export function getOptionsFromQuery<I extends HasId, Out = I>(
  params: FromQueryBaseParams<I> & {
    then?: (items: I[]) => Promise<Out[]>;
  }
): GetOptions<Out> {
  return (input) => {
    return params
      .getOptions({
        condition: {
          And: [
            params.condition ?? { Always: true },
            conditionFromSearchFields(params.searchFields, input),
          ],
        },
        orderBy: params.orderBy,
        limit: params.limit,
      })
      .then(async (res) => {
        if (params.then) {
          return params.then(res);
        } else return res as unknown as Out[];
      });
  };
}

export function sortByMap<O>(options: O[], map: (option: O) => string): O[] {
  return options.sort((a, b) => map(a).localeCompare(map(b)));
}
