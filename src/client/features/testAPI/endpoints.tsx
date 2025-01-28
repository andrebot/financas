import { EndpointBuilder } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { FetchBaseQueryMeta } from "@reduxjs/toolkit/query";
import { FetchArgs } from "@reduxjs/toolkit/query";

type ApiBuilder = EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta>, never, "api">

export default function testBuilder(builder: ApiBuilder) {
  return {
    test: builder.query({
      query: () => '/test',
    }),
  };
}
