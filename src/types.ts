export type PageSize = 'a4' | 'letter' | 'legal';
export type MarginSize = '12px' | '24px' | '36px';

export interface PageItem {
  id: string;
  content: string;
}

export interface FontOption {
  label: string;
  value: string;
}

export interface SizeOption {
  label: string;
  value: string;
}

export interface FormatOption {
  label: string;
  value: PageSize;
}

export interface MarginOption {
  label: string;
  value: MarginSize;
  description: string;
}

export interface TemplateOption {
  label: string;
  key: string;
}

export type ActiveDrawer = 'font' | 'size' | 'format' | 'margin' | 'template' | null;
