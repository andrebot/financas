import baseApi from '../apiSlice';
import type { ApiBuilder, Category } from '../../types';

/**
 * Builds the request used to list categories.
 *
 * @returns The RTK Query request configuration.
 */
export const listCategoryQuery = () => ({
  url: '/category',
  method: 'GET',
});

/**
 * Builds the request used to create a category.
 *
 * @param body - The category payload to create.
 * @returns The RTK Query request configuration.
 */
export const createCategoryMutation = (body: Category) => ({
  url: '/category',
  method: 'POST',
  body,
});

/**
 * Builds the request used to update a category.
 *
 * @param body - The category payload to update.
 * @returns The RTK Query request configuration.
 */
export const updateCategoryMutation = (body: Category) => ({
  url: `/category/${body.id}`,
  method: 'PUT',
  body,
});

/**
 * Builds the request used to delete a category.
 *
 * @param id - The id of the category to delete.
 * @returns The RTK Query request configuration.
 */
export const deleteCategoryMutation = (id: number) => ({
  url: `/category/${id}`,
  method: 'DELETE',
});

/**
 * Builds the request used to load a single category.
 *
 * @param id - The id of the category to load.
 * @returns The RTK Query request configuration.
 */
export const getCategoryQuery = (id: number) => ({
  url: `/category/${id}`,
  method: 'GET',
});

/**
 * Registers the category endpoints with the shared RTK Query API builder.
 * This is exported separately so endpoint wiring can be unit tested.
 *
 * @param builder - The RTK Query endpoint builder.
 * @returns The category endpoint definitions.
 */
export const endpoints = (builder: ApiBuilder) => ({
  listCategories: builder.query<Category[], void>({
    query: listCategoryQuery,
    providesTags: [{ type: 'Category', id: 'LIST' }],
  }),
  createCategory: builder.mutation<Category, Category>({
    query: createCategoryMutation,
    invalidatesTags: [{ type: 'Category', id: 'LIST' }],
  }),
  updateCategory: builder.mutation<Category, Category>({
    query: updateCategoryMutation,
    invalidatesTags: [{ type: 'Category', id: 'LIST' }],
  }),
  deleteCategory: builder.mutation<Category, number>({
    query: deleteCategoryMutation,
    invalidatesTags: [{ type: 'Category', id: 'LIST' }],
  }),
  getCategory: builder.query<Category, number>({
    query: getCategoryQuery,
  }),
});

export const categoryAPI = baseApi.injectEndpoints({
  endpoints,
});

export const {
  useListCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryQuery,
} = categoryAPI;
