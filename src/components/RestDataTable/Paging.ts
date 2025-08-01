import {
  HasId,
  Condition,
  RestEndpoint,
} from "@lightningkite/lightning-server-simplified";
import { GetRows, GetRowsParams } from "./RestDataTable";

export function getRowsFromEndpoint<I extends HasId>(
  params: FromEndpointBaseParams<I>
): GetRows<I, I> {
  return (paramsInner: GetRowsParams<I>) => {
    const c: Condition<I> = {
      And: [paramsInner.searchCondition, params.condition ?? { Always: true }],
    };
    return {
      condition: c,
      pageGetter: (p) =>
        params.endpoint.query({
          condition: c,
          limit: p.limit,
          orderBy: paramsInner.orderBy,
          skip: p.skip,
        }),
      getCount: (condition) => params.endpoint.count({ And: [condition, c] }),
    };
  };
}

interface FromEndpointBaseParams<I extends HasId> {
  endpoint: RestEndpoint<I>;
  condition?: Condition<I>;
}
