export type Category = {
  id?: string;
  name: string;
  user: string;
  parentCategory?: {
    details: string;
    name: string;
  };
};

export type FormattedCategory = Category & {
  children: Category[];
};
