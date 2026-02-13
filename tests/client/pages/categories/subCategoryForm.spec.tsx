import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../../src/client/i18n';
import i18nEn from '../../../../src/client/i18n/en';
import SubCategoryForm from '../../../../src/client/pages/categories/subCategoryForm';

describe('SubCategoryForm', () => {
  const mockOnAddSubCategory = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const setup = () =>
    render(
      <I18nextProvider i18n={i18n}>
        <SubCategoryForm onAddSubCategory={mockOnAddSubCategory} />
      </I18nextProvider>
    );

  it('should render the input field and add button', () => {
    setup();

    expect(screen.getByLabelText(i18nEn.translation.subCategoryName)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: i18nEn.translation.addSubCategory })).toBeInTheDocument();
  });

  it('should call onAddSubCategory when form is filled and add button is clicked', () => {
    setup();

    fireEvent.change(screen.getByLabelText(i18nEn.translation.subCategoryName), {
      target: { value: 'New Sub Category' },
    });

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.addSubCategory }));

    expect(mockOnAddSubCategory).toHaveBeenCalledWith('New Sub Category');
  });

  it('should clear the input after adding sub-category', () => {
    setup();

    fireEvent.change(screen.getByLabelText(i18nEn.translation.subCategoryName), {
      target: { value: 'New Sub Category' },
    });

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.addSubCategory }));

    expect(screen.getByLabelText(i18nEn.translation.subCategoryName)).toHaveValue('');
  });

  it('should not call onAddSubCategory when input is empty', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.addSubCategory }));

    expect(mockOnAddSubCategory).not.toHaveBeenCalled();
  });
});
