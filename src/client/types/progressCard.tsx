export type ProgressItem = {
  id?: number;
  name: string;
  current: number;
  total: number;
};

export type ProgressColors = {
  low: string;
  medium: string;
  high: string;
  complete: string;
};

export type ProgressCardProps = {
  title: string;
  items: ProgressItem[];
  colors: ProgressColors;
};
