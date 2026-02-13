import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import PlusIcon from '@mui/icons-material/Add';
import Chip from '@mui/material/Chip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SubCategoryForm from './subCategoryForm';
import {
  CategoriesMain,
  CategoryList,
  AddCategoryButton,
  ParentCategory,
  CategoryTitleHolder,
  SubCategoryList,
} from './styledComponents';
import { Category, FormattedCategory } from '../../types';
import { useAuth } from '../../hooks/authContext';
import { useModal } from '../../components/modal/modal';
import AddCategoryModal from './addCategoryModal';
import ConfirmDeleteCategoryModal from '../../components/confirmModal';
import {
  useListCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '../../features/category';

/**
 * Main component for the categories page. This has the logic for all the
 * Category CRUD operations.
 *
 * @returns The categories page
 */
export default function Categories(): React.JSX.Element {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showModal, closeModal } = useModal();
  const anchorEl = useRef<HTMLButtonElement>(null);
  const { data: categoryList = [] } = useListCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [formattedCategories, setFormattedCategories] = useState<FormattedCategory[]>([]);

  useEffect(() => {
    if (categoryList && categoryList.length > 0) {
      setFormattedCategories(formatCategories(categoryList));
    }
  }, [categoryList]);

  /**
   * Formats the categories to be displayed in the UI.
   * E.g.:
   * [
   *   {
   *     id: '1',
   *     name: 'Category 1',
   *     user: '1',
   *     children: [
   *       { id: '2', name: 'Sub-category 1' },
   *       { id: '3', name: 'Sub-category 2' },
   *     ],
   *   },
   * ]
   *
   * @remarks
   * The categories from the API are a flat list of categories.
   * This function formats them into a tree structure.
   *
   * @param categories List of categories to be formatted
   * @returns Formatted categories
   */
  const formatCategories = (categories: Category[]) => {
    const newFormattedCategories: FormattedCategory[] = [];

    categories.forEach((category) => {
      if (category.parentCategory) {
        newFormattedCategories.find((c) => c.id === category.parentCategory)?.children
          .push(category);
      } else {
        newFormattedCategories.push({
          ...category,
          children: [],
        });
      }
    });

    return newFormattedCategories;
  };

  /**
   * Handles the deletion of a sub-category.
   *
   * @param subCategoryId - The id of the sub-category to delete
   */
  const handleDeleteSubCategory = async (subCategoryId: string) => {
    try {
      await deleteCategory(subCategoryId).unwrap();

      enqueueSnackbar(t('subCategoryDeleted'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('subCategoryDeletionFailed'), { variant: 'error' });
    }
  };

  /**
   * Handles the addition of a sub-category.
   *
   * @remarks
   * After the save is done we focus the input field to allow the user to
   * quickly add another sub-category.
   *
   * @param parentCategoryId - The id of the parent category
   * @param subCategoryName - The name of the sub-category
   */
  const handleAddSubCategory = async (parentCategoryId: string, subCategoryName: string) => {
    try {
      await createCategory({
        name: subCategoryName,
        user: user!.id,
        parentCategory: parentCategoryId,
      }).unwrap();

      enqueueSnackbar(t('subCategoryCreated'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('subCategoryCreationFailed'), { variant: 'error' });
    }

    anchorEl.current?.focus();
  };

  /**
   * Handles the deletion of a category.
   *
   * @param categoryId - The id of the category to delete
   */
  const handleDeleteCategoryConfirmation = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId).unwrap();

      enqueueSnackbar(t('categoryDeleted'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('categoryDeletionFailed'), { variant: 'error' });
    } finally {
      closeModal();
    }
  };

  /**
   * Opens the modal to confirm the deletion of a category.
   *
   * @param categoryId - The id of the category to delete
   */
  const handleDeleteCategory = (categoryId: string) => {
    showModal(
      <ConfirmDeleteCategoryModal
        title={t('deleteCategoryModalTitle')}
        confirmationText={t('deleteCategoryConfirmation')}
        onConfirm={() => handleDeleteCategoryConfirmation(categoryId)}
        onCancel={() => closeModal()}
      />,
    );
  };

  /**
   * Handles the saving of a category.
   *
   * @param categoryName - The name of the category
   * @returns The function to save the category
   */
  const handleSaveCategory = async (categoryName: string) => {
    try {
      await createCategory({
        name: categoryName,
        user: user!.id,
      }).unwrap();

      enqueueSnackbar(t('categoryCreated'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('categoryCreationFailed'), { variant: 'error' });
    }
  };

  /**
   * Opens the modal to add a category.
   */
  const handleAddCategory = () => {
    showModal(
      <AddCategoryModal onSaveCategory={handleSaveCategory} />,
    );
  };

  /**
   * Handles the updating of a category.
   *
   * @param category - The category to update
   * @param newName - The new name of the category
   * @returns The function to update the category
   */
  const handleUpdateCategory = async (category: FormattedCategory, newName: string) => {
    try {
      await updateCategory({
        id: category.id!,
        name: newName,
        user: category.user,
        parentCategory: category.parentCategory,
      }).unwrap();

      enqueueSnackbar(t('categoryUpdated'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('categoryUpdateFailed'), { variant: 'error' });
    }
  };

  /**
   * Opens the modal to edit a category.
   *
   * @param category - The category to edit
   */
  const handleEditCategory = (category: FormattedCategory) => {
    showModal(
      <AddCategoryModal
        category={category}
        onSaveCategory={(categoryName) => handleUpdateCategory(category, categoryName)}
      />,
    );
  };

  return (
    <CategoriesMain>
      <Typography variant="h2">{t('categories')}</Typography>
      <CategoryList>
        <AddCategoryButton title={t('createCategory')}>
          <IconButton aria-label={t('createCategory')} size="large" onClick={handleAddCategory}>
            <PlusIcon />
          </IconButton>
        </AddCategoryButton>
        {formattedCategories.map((category) => (
          <ParentCategory elevation={6} key={category.id}>
            <CategoryTitleHolder>
              <Typography variant="h3">{category.name}</Typography>
              <IconButton size="large" onClick={() => handleEditCategory(category)}>
                <EditIcon />
              </IconButton>
              <IconButton size="large" onClick={() => handleDeleteCategory(category.id!)}>
                <DeleteIcon />
              </IconButton>
            </CategoryTitleHolder>
            <SubCategoryList>
              {category.children.map((subCategory) => (
                <Chip
                  key={subCategory.id}
                  label={subCategory.name}
                  onDelete={() => handleDeleteSubCategory(subCategory.id!)}
                  data-testid="subCategoryChip"
                />
              ))}
            </SubCategoryList>
            <SubCategoryForm
              onAddSubCategory={(subCategoryName) => handleAddSubCategory(
                category.id!,
                subCategoryName,
              )}
              data-testid="subCategoryForm"
            />
          </ParentCategory>
        ))}
      </CategoryList>
    </CategoriesMain>
  );
}
