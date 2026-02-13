import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../../src/client/i18n';
import i18nEn from '../../../../src/client/i18n/en';
import AddCategoryModal from '../../../../src/client/pages/categories/addCategoryModal';
import { useModal } from '../../../../src/client/components/modal/modal';

jest.mock('../../../../src/client/components/modal/modal', () => ({
  useModal: jest.fn(),
}));

describe('AddCategoryModal', () => {
  const mockCloseModal = jest.fn();
  const mockOnSaveCategory = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    (useModal as jest.Mock).mockReturnValue({ closeModal: mockCloseModal });
  });

  const setup = (category?: { id?: string; name: string; user: string }) =>
    render(
      <I18nextProvider i18n={i18n}>
        <AddCategoryModal onSaveCategory={mockOnSaveCategory} category={category} />
      </I18nextProvider>
    );

  it('should render the modal fields and buttons', () => {
    setup();

    expect(screen.getByLabelText(i18nEn.translation.categoryName)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: i18nEn.translation.saveCategory })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should allow filling form and saving category', () => {
    setup();

    fireEvent.change(screen.getByLabelText(i18nEn.translation.categoryName), {
      target: { value: 'New Category' },
    });

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.saveCategory }));

    expect(mockOnSaveCategory).toHaveBeenCalledWith('New Category');
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('should close the modal when cancel is clicked', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('should pre-fill the category name when editing existing category', () => {
    setup({ id: 'cat-1', name: 'Food', user: 'user-1' });

    expect(screen.getByLabelText(i18nEn.translation.categoryName)).toHaveValue('Food');
  });

  it('should call onSaveCategory with updated name when editing', () => {
    setup({ id: 'cat-1', name: 'Food', user: 'user-1' });

    fireEvent.change(screen.getByLabelText(i18nEn.translation.categoryName), {
      target: { value: 'Updated Food' },
    });

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.saveCategory }));

    expect(mockOnSaveCategory).toHaveBeenCalledWith('Updated Food');
    expect(mockCloseModal).toHaveBeenCalled();
  });
});
