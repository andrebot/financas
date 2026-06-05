export type Category = {
  id?: number;
  name: string;
  userId: number;
  parentCategoryId?: number | null;
};

export type FormattedCategory = Category & {
  children: Category[];
};
