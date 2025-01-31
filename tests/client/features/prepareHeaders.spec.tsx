import { prepareNonAuthHeaders } from "../../../src/client/features/prepareHeaders";

describe('prepareHeaders', () => {
  it('should prepare the headers for the API requests for simple non authenticated requests', () => {
    const headers = new Headers();
    
    const preparedHeaders = prepareNonAuthHeaders(headers);

    expect(preparedHeaders.get('Content-Type')).toBe('application/json');
  });
});
