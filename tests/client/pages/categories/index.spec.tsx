import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import i18n from '../../../../src/client/i18n';
import i18nEn from '../../../../src/client/i18n/en';
import Categories from '../../../../src/client/pages/categories';
import { useModal } from '../../../../src/client/components/modal/modal';
import { useAuth } from '../../../../src/client/hooks/authContext';
import {
  useListCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '../../../../src/client/features/category';

jest.mock('notistack', () => ({
  enqueueSnackbar: jest.fn(),
}));

jest.mock('../../../../src/client/components/modal/modal', () => ({
  useModal: jest.fn(),
}));

jest.mock('../../../../src/client/hooks/authContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../src/client/features/category', () => ({
  useListCategoriesQuery: jest.fn(),
  useCreateCategoryMutation: jest.fn(),
  useDeleteCategoryMutation: jest.fn(),
  useUpdateCategoryMutation: jest.fn(),
}));

describe('Categories page', () => {
  const mockShowModal = jest.fn();
  const mockCloseModal = jest.fn();
  const mockCreateCategory = jest.fn();
  const mockDeleteCategory = jest.fn();
  const mockUpdateCategory = jest.fn();

  const mockUser = { id: 'user-1', email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'user' };

  beforeEach(() => {
    jest.resetAllMocks();

    (useModal as jest.Mock).mockReturnValue({ showModal: mockShowModal, closeModal: mockCloseModal });
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useListCategoriesQuery as jest.Mock).mockReturnValue({
      data: [
        { id: 'cat-1', name: 'Food', user: 'user-1' },
        { id: 'cat-2', name: 'Sub Food', user: 'user-1', parentCategory: 'cat-1' },
      ],
    });
    (useCreateCategoryMutation as jest.Mock).mockReturnValue([
      mockCreateCategory,
      { isError: false, isSuccess: false },
    ]);
    (useDeleteCategoryMutation as jest.Mock).mockReturnValue([
      mockDeleteCategory,
      { isError: false, isSuccess: false },
    ]);
    (useUpdateCategoryMutation as jest.Mock).mockReturnValue([
      mockUpdateCategory,
      { isError: false, isSuccess: false },
    ]);
  });

  const setup = () =>
    render(
      <I18nextProvider i18n={i18n}>
        <Categories />
      </I18nextProvider>
    );

  it('should render categories title and create button', () => {
    setup();

    expect(screen.getByText(i18nEn.translation.categories)).toBeInTheDocument();
    expect(screen.getByLabelText(i18nEn.translation.createCategory)).toBeInTheDocument();
  });

  it('should render parent categories with their sub-categories', () => {
    setup();

    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Sub Food')).toBeInTheDocument();
  });

  it('should use default empty array when useListCategoriesQuery returns no data', () => {
    (useListCategoriesQuery as jest.Mock).mockReturnValue({});

    setup();

    expect(screen.getByText(i18nEn.translation.categories)).toBeInTheDocument();
    expect(screen.getByLabelText(i18nEn.translation.createCategory)).toBeInTheDocument();
    expect(screen.queryByText('Food')).not.toBeInTheDocument();
  });

  it('should format flat categories into tree structure', () => {
    (useListCategoriesQuery as jest.Mock).mockReturnValue({
      data: [
        { id: 'parent-1', name: 'Parent', user: 'user-1' },
        { id: 'child-1', name: 'Child', user: 'user-1', parentCategory: 'parent-1' },
      ],
    });

    setup();

    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('should open add category modal when clicking create button', () => {
    setup();

    fireEvent.click(screen.getByLabelText(i18nEn.translation.createCategory));

    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });

  it('should call createCategory when add category modal saves', async () => {
    mockCreateCategory.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    setup();

    fireEvent.click(screen.getByLabelText(i18nEn.translation.createCategory));

    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement;
    const props = modalElement.props as { onSaveCategory: (categoryName: string) => void };

    props.onSaveCategory('New Category');

    await waitFor(() => {
      expect(mockCreateCategory).toHaveBeenCalledWith({
        name: 'New Category',
        user: mockUser.id,
      });
    });
  });

  it('should show success notification when category is created successfully', async () => {
    mockCreateCategory.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    setup();

    fireEvent.click(screen.getByLabelText(i18nEn.translation.createCategory));

    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement;
    const props = modalElement.props as { onSaveCategory: (categoryName: string) => void };

    props.onSaveCategory('New Category');

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.categoryCreated, {
        variant: 'success',
      });
    });
  });

  it('should show error notification when category creation fails', async () => {
    mockCreateCategory.mockReturnValue({ unwrap: () => Promise.reject(new Error('Failed')) });

    setup();

    fireEvent.click(screen.getByLabelText(i18nEn.translation.createCategory));

    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement;
    const props = modalElement.props as { onSaveCategory: (categoryName: string) => void };

    props.onSaveCategory('New Category');

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.categoryCreationFailed, {
        variant: 'error',
      });
    });
  });

  it('should open edit category modal when clicking edit button', () => {
    setup();

    const editButtons = screen.getAllByRole('button', { name: '' });
    const editButton = editButtons.find((btn) => btn.closest('[class*="CategoryTitleHolder"]'));
    if (editButton) {
      fireEvent.click(editButton);
    } else {
      fireEvent.click(screen.getAllByTestId('EditIcon')[0].closest('button')!);
    }

    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });

  it('should call updateCategory when edit category modal saves', async () => {
    mockUpdateCategory.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    setup();

    const editButtons = screen.getAllByRole('button');
    const editIconButton = editButtons.find((btn) => btn.querySelector('[data-testid="EditIcon"]'));
    fireEvent.click(editIconButton!);

    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement;
    const props = modalElement.props as {
      category: { id: string; name: string; user: string };
      onSaveCategory: (categoryName: string) => void;
    };

    props.onSaveCategory('Updated Food');

    await waitFor(() => {
      expect(mockUpdateCategory).toHaveBeenCalledWith({
        id: 'cat-1',
        name: 'Updated Food',
        user: 'user-1',
        parentCategory: undefined,
      });
    });
  });

  it('should show success notification when category is updated successfully', async () => {
    mockUpdateCategory.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    setup();

    const editIconButton = screen.getAllByRole('button').find((btn) => btn.querySelector('[data-testid="EditIcon"]'));
    fireEvent.click(editIconButton!);

    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement;
    const props = modalElement.props as { onSaveCategory: (categoryName: string) => void };

    props.onSaveCategory('Updated Food');

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(expect.any(String), {
        variant: 'success',
      });
    });
  });

  it('should show error notification when category update fails', async () => {
    mockUpdateCategory.mockReturnValue({ unwrap: () => Promise.reject(new Error('Failed')) });

    setup();

    const editIconButton = screen.getAllByRole('button').find((btn) => btn.querySelector('[data-testid="EditIcon"]'));
    fireEvent.click(editIconButton!);

    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement;
    const props = modalElement.props as { onSaveCategory: (categoryName: string) => void };

    props.onSaveCategory('Updated Food');

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(expect.any(String), {
        variant: 'error',
      });
    });
  });

  it('should open delete confirmation modal when clicking delete button', () => {
    setup();

    const deleteButtons = screen.getAllByRole('button');
    const deleteIconButton = deleteButtons.find((btn) => btn.querySelector('[data-testid="DeleteIcon"]'));
    fireEvent.click(deleteIconButton!);

    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });

  it('should close modal and not delete when cancel is clicked in confirm delete modal', () => {
    setup();

    const deleteButtons = screen.getAllByRole('button');
    const deleteIconButton = deleteButtons.find((btn) => btn.querySelector('[data-testid="DeleteIcon"]'));
    fireEvent.click(deleteIconButton!);

    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement;
    const props = modalElement.props as { onCancel: () => void };

    props.onCancel();

    expect(mockCloseModal).toHaveBeenCalled();
    expect(mockDeleteCategory).not.toHaveBeenCalled();
  });

  it('should call deleteCategory when delete confirmation is confirmed', async () => {
    mockDeleteCategory.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    setup();

    const deleteButtons = screen.getAllByRole('button');
    const deleteIconButton = deleteButtons.find((btn) => btn.querySelector('[data-testid="DeleteIcon"]'));
    fireEvent.click(deleteIconButton!);

    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement;
    const props = modalElement.props as { onConfirm: () => void };

    props.onConfirm();

    await waitFor(() => {
      expect(mockDeleteCategory).toHaveBeenCalledWith('cat-1');
    });
  });

  it('should show success notification and close modal when category is deleted successfully', async () => {
    mockDeleteCategory.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    setup();

    const deleteButtons = screen.getAllByRole('button');
    const deleteIconButton = deleteButtons.find((btn) => btn.querySelector('[data-testid="DeleteIcon"]'));
    fireEvent.click(deleteIconButton!);

    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement;
    const props = modalElement.props as { onConfirm: () => void };

    props.onConfirm();

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.categoryDeleted, {
        variant: 'success',
      });
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });

  it('should show error notification when category deletion fails', async () => {
    mockDeleteCategory.mockReturnValue({ unwrap: () => Promise.reject(new Error('Failed')) });

    setup();

    const deleteButtons = screen.getAllByRole('button');
    const deleteIconButton = deleteButtons.find((btn) => btn.querySelector('[data-testid="DeleteIcon"]'));
    fireEvent.click(deleteIconButton!);

    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement;
    const props = modalElement.props as { onConfirm: () => void };

    props.onConfirm();

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.categoryDeletionFailed, {
        variant: 'error',
      });
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });

  it('should call deleteCategory when sub-category chip delete is clicked', async () => {
    mockDeleteCategory.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    setup();

    const subCategoryChip = screen.getByText('Sub Food');
    const deleteButton = subCategoryChip.parentElement?.querySelector('[class*="MuiChip-deleteIcon"]');
    fireEvent.click(deleteButton!);

    await waitFor(() => {
      expect(mockDeleteCategory).toHaveBeenCalledWith('cat-2');
    });
  });

  it('should show success notification when sub-category is deleted successfully', async () => {
    mockDeleteCategory.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    setup();

    const subCategoryChip = screen.getByText('Sub Food');
    const deleteButton = subCategoryChip.parentElement?.querySelector('[class*="MuiChip-deleteIcon"]');
    fireEvent.click(deleteButton!);

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.subCategoryDeleted, {
        variant: 'success',
      });
    });
  });

  it('should show error notification when sub-category deletion fails', async () => {
    mockDeleteCategory.mockReturnValue({ unwrap: () => Promise.reject(new Error('Failed')) });

    setup();

    const subCategoryChip = screen.getByText('Sub Food');
    const deleteButton = subCategoryChip.parentElement?.querySelector('[class*="MuiChip-deleteIcon"]');
    fireEvent.click(deleteButton!);

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.subCategoryDeletionFailed, {
        variant: 'error',
      });
    });
  });

  it('should call createCategory when adding sub-category', async () => {
    mockCreateCategory.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    setup();

    const subCategoryInput = screen.getByLabelText(i18nEn.translation.subCategoryName);
    fireEvent.change(subCategoryInput, { target: { value: 'New Sub' } });

    const addButton = screen.getByRole('button', { name: i18nEn.translation.addSubCategory });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockCreateCategory).toHaveBeenCalledWith({
        name: 'New Sub',
        user: mockUser.id,
        parentCategory: 'cat-1',
      });
    });
  });

  it('should show success notification when sub-category is created successfully', async () => {
    mockCreateCategory.mockReturnValue({ unwrap: () => Promise.resolve({}) });

    setup();

    const subCategoryInput = screen.getByLabelText(i18nEn.translation.subCategoryName);
    fireEvent.change(subCategoryInput, { target: { value: 'New Sub' } });

    const addButton = screen.getByRole('button', { name: i18nEn.translation.addSubCategory });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.subCategoryCreated, {
        variant: 'success',
      });
    });
  });

  it('should show error notification when sub-category creation fails', async () => {
    mockCreateCategory.mockReturnValue({ unwrap: () => Promise.reject(new Error('Failed')) });

    setup();

    const subCategoryInput = screen.getByLabelText(i18nEn.translation.subCategoryName);
    fireEvent.change(subCategoryInput, { target: { value: 'New Sub' } });

    const addButton = screen.getByRole('button', { name: i18nEn.translation.addSubCategory });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.subCategoryCreationFailed, {
        variant: 'error',
      });
    });
  });
});
