import baseApi from '../apiSlice';
import type { ApiBuilder, Category } from '../../types';

export const listCategoryQuery = () => ({
  url: '/category',
  method: 'GET',
});

export const createCategoryMutation = (body: Category) => ({
  url: '/category',
  method: 'POST',
  body,
});

export const updateCategoryMutation = (body: Category) => ({
  url: `/category/${body.id}`,
  method: 'PUT',
  body,
});

export const deleteCategoryMutation = (id: string) => ({
  url: `/category/${id}`,
  method: 'DELETE',
});

export const getCategoryQuery = (id: string) => ({
  url: `/category/${id}`,
  method: 'GET',
});

// This was done so testing would be easier.
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
  deleteCategory: builder.mutation<Category, string>({
    query: deleteCategoryMutation ,
    invalidatesTags: [{ type: 'Category', id: 'LIST' }],
  }),
  getCategory: builder.query<Category, string>({
    query: getCategoryQuery ,
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
