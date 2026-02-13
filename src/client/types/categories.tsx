export type Category = {
  id?: string;
  name: string;
  user: string;
  parentCategory?: string;
};

export type FormattedCategory = Category & {
  children: Category[];
};
