export type Category = {
  id?: number;
  name: string;
  userId: number;
  parentCategoryId?: number | null;
};

export type FormattedCategory = Category & {
  children: Category[];
};

export type CategorySelectOption = {
  id: number;
  label: string;
};

export type AddCategoryModalProps = {
  onSaveCategory: (categoryName: string) => void;
  category?: Category;
};

export type SubCategoryFormProps = {
  onAddSubCategory: (subCategoryName: string) => void;
};
