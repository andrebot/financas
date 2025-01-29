import { EndpointBuilder } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { FetchBaseQueryMeta } from "@reduxjs/toolkit/query";
import { FetchArgs } from "@reduxjs/toolkit/query";

import type { LoginBody, LoginResponse } from '../../types/authContextType';

type ApiBuilder = EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta>, never, "loginApi">

export default function testBuilder(builder: ApiBuilder) {
  return {
    login: builder.mutation<LoginResponse, LoginBody>({
      query: (body: LoginBody) => ({
        url: '/login',
        method: 'POST',
        body,
      }),
    }),
  };
}
