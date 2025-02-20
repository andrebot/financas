import { prepareHeaders } from "../../../src/client/features/prepareHeaders";
import type { RootState } from "../../../src/client/features/store";
import type { RTKApi } from "../../../src/client/features/prepareHeaders";

describe('prepareHeaders', () => {
  it('should prepare the headers for the API requests for simple non authenticated requests', () => {
    const headers = new Headers();
    const preparedHeaders = prepareHeaders(headers, { 
      getState: () => ({ 
        theme: 'light',
        auth: { accessToken: '123', user: null },
        loginApi: {} as RootState['loginApi']
      }),
      extra: undefined,
      endpoint: '',
      type: 'query'
    } as RTKApi);

    expect(preparedHeaders?.get('Content-Type')).toBe('application/json');
  });
});
