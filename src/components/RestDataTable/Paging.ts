import {
  HasId,
  Condition,
  RestEndpoint,
  SortPart,
} from "@lightningkite/lightning-server-simplified";
import {
  GetRows,
  GetRowsParams,
  PageGetter,
  PageGetterParams,
} from "./RestDataTable";

type FromEndpointThen<I extends HasId, R> = (items: I[]) => Promise<R[]> | R[];

export function getRowsFromEndpoint<I extends HasId, R = I>(
  params: FromEndpointBaseParams<I> & { then: FromEndpointThen<I, R> }
): GetRows<I, R>;

export function getRowsFromEndpoint<I extends HasId>(
  params: FromEndpointBaseParams<I>
): GetRows<I, I>;

export function getRowsFromEndpoint<I extends HasId, R = I>(
  params: FromEndpointBaseParams<I> & { then?: FromEndpointThen<I, R> }
): GetRows<I, I | R> {
  return (getRowsParams) => {
    const { endpoint, condition, then } = params;
    const pageGetter = (pageGetterParams: PageGetterParams) => {
      const query = {
        condition: {
          And: [
            getRowsParams.searchCondition,
            condition,
            params.condition,
          ].filter((s) => !!s),
        } as Condition<I>,
        orderBy: params.orderBy,
        ...pageGetterParams,
      };
      return params.endpoint.query(query);
    };

    return {
      getCount: endpoint.count,
      pageGetter: then
        ? (pageGetterParams) => pageGetter(pageGetterParams).then(then)
        : pageGetter,
      condition: condition ?? { Always: true },
    };
  };
}

interface FromEndpointBaseParams<I extends HasId> {
  endpoint: RestEndpoint<I>;
  condition?: Condition<I>;
  orderBy?: SortPart<I>[];
}
export function pageGetterFromEndpoint<I extends HasId>(
  params: FromEndpointBaseParams<I>
): PageGetter<I> {
  return (pageGetterParams) => {
    const query = {
      condition: params.condition,
      orderBy: params.orderBy,
      ...pageGetterParams,
    };
    return params.endpoint.query(query);
  };
}
