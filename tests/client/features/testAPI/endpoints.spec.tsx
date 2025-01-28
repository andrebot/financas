import endpoints from '../../../../src/client/features/testAPI/endpoints';

describe('testBuilder', () => {
  const builderMock = {
    query: jest.fn(),
  };

  it('should return a query endpoint', () => {
    endpoints(builderMock as any);

    const queryFn = builderMock.query.mock.calls[0][0].query;

    expect(builderMock.query).toHaveBeenCalledWith({
      query: expect.any(Function),
    });
    expect(queryFn()).toBe('/test');
  });
});
