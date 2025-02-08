import { DataRecord } from './index';

export type ColumnType = 'text' | 'checkbox' | 'select';

export interface CustomColumn {
  name: string;
  type: ColumnType;
  label: string;
  helperText?: string;
  options?: string[];  // For select type
}

export interface Project {
  id: string;
  name: string;
  userId: string;
  data: any[];
  columns: string[];
  columnOrder?: string[];
  customColumns: Record<string, CustomColumn>;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  recordCount: number;
} 