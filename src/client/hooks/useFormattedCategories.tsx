import { useMemo } from 'react';
import { useListCategoriesQuery } from '../features/category';
import type { Category, CategorySelectOption } from '../types';

/**
 * Reducer that appends a category select option when the category has a known parent.
 *
 * @param categoryNamesById - Map of category id to name used to resolve parent names.
 * @param acc - Accumulated select options.
 * @param category - Current category being processed.
 * @returns The updated accumulator.
 */
function toCategorySelectOption(
  categoryNamesById: Map<number | undefined, string>,
  acc: CategorySelectOption[],
  category: Category,
): CategorySelectOption[] {
  const parentName = category.parentCategoryId
    ? categoryNamesById.get(category.parentCategoryId)
    : undefined;

  if (parentName && category.id !== undefined) {
    acc.push({ id: category.id, label: `${parentName} - ${category.name}` });
  }

  return acc;
}

/**
 * Formats child categories with their parent category names for use in a select.
 *
 * @param categories - Flat category list returned by the API.
 * @returns Category ids and display labels in the format "Parent - Child", sorted alphabetically.
 */
export function formatCategories(categories: Category[]): CategorySelectOption[] {
  const categoryNamesById = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  return categories
    .reduce((acc, category) => toCategorySelectOption(
      categoryNamesById,
      acc,
      category,
    ), [] as CategorySelectOption[])
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Returns the list of child categories formatted as select options.
 * Fetches categories from the API and memoizes the formatted result.
 *
 * @returns Sorted array of category select options with "Parent - Child" labels.
 */
export function useFormattedCategories(): CategorySelectOption[] {
  const { data: categories = [] } = useListCategoriesQuery();

  return useMemo(() => formatCategories(categories), [categories]);
}
