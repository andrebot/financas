import { FetchBaseQueryMeta } from "@reduxjs/toolkit/query";
import { loginApi } from "./login";
import { setAccessToken } from "./authSlice";
import { clearAccessToken } from "./authSlice";
import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "./prepareHeaders";
import config from "../config/apiConfig";
import  type { RefreshTokenResponse } from "../types/authContextType";

const baseQuery = fetchBaseQuery({
  baseUrl: config.api.user,
  prepareHeaders,
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.meta?.response?.status === 401) {
    const refreshResult = await baseQuery('/refresh-token', api, extraOptions);

    if (refreshResult.data) {
      api.dispatch(setAccessToken((refreshResult.data as RefreshTokenResponse).accessToken))
      result = await baseQuery(args, api, extraOptions)
    } else {
      await api.dispatch(loginApi.endpoints.logout.initiate());
      api.dispatch(clearAccessToken())
    }
  }
  return result
}

export default baseQueryWithReauth;
