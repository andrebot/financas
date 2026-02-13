import {
  listCategoryQuery,
  createCategoryMutation,
  updateCategoryMutation,
  deleteCategoryMutation,
  getCategoryQuery,
  endpoints,
} from '../../../../src/client/features/category';
import type { Category } from '../../../../src/client/types/categories';

const mockBuilder = {
  query: jest.fn(() => ({})),
  mutation: jest.fn(() => ({})),
};

describe('category endpoints', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockBuilder.query.mockReturnValue('test');
    mockBuilder.mutation.mockReturnValue('test');
  });

  describe('query/mutation builders', () => {
    it('should correctly prepare the list category query request', () => {
      const result = listCategoryQuery();

      expect(result).toBeDefined();
      expect(result.url).toBe('/category');
      expect(result.method).toBe('GET');
    });

    it('should correctly prepare the create bank account mutation request', () => {
      const category: Category = {
        name: 'My category',
        user: 'user-1',
      };

      const result = createCategoryMutation(category);

      expect(result).toBeDefined();
      expect(result.url).toBe('/category');
      expect(result.method).toBe('POST');
      expect(result.body).toEqual(category);
    });

    it('should correctly prepare the update bank account mutation request', () => {
      const category: Category = {
        id: 'category-1',
        name: 'Updated category',
        user: 'user-1',
      };

      const result = updateCategoryMutation(category);

      expect(result).toBeDefined();
      expect(result.url).toBe('/category/category-1');
      expect(result.method).toBe('PUT');
      expect(result.body).toEqual(category);
    });

    it('should correctly prepare the delete bank account mutation request', () => {
      const result = deleteCategoryMutation('category-1');

      expect(result).toBeDefined();
      expect(result.url).toBe('/category/category-1');
      expect(result.method).toBe('DELETE');
    });

    it('should correctly prepare the get category query request', () => {
      const result = getCategoryQuery('category-1');

      expect(result).toBeDefined();
      expect(result.url).toBe('/category/category-1');
      expect(result.method).toBe('GET');
    });
  });

  describe('endpoints', () => {
    it('should have all category endpoints', () => {
      const builtEndpoints = endpoints(mockBuilder as any);

      expect(builtEndpoints).toBeDefined();
      expect(builtEndpoints.listCategories).toBeDefined();
      expect(builtEndpoints.createCategory).toBeDefined();
      expect(builtEndpoints.updateCategory).toBeDefined();
      expect(builtEndpoints.deleteCategory).toBeDefined();
      expect(builtEndpoints.getCategory).toBeDefined();
      expect(mockBuilder.query).toHaveBeenCalledTimes(2);
      expect(mockBuilder.mutation).toHaveBeenCalledTimes(3);
    });
  });
});
