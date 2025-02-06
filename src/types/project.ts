import { DataRecord } from './index';

export type ColumnType = 'text' | 'checkbox' | 'select';

export interface CustomColumn {
  name: string;
  type: ColumnType;
  helperText?: string;
  options?: string[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  data: any[];
  columns: string[];
  customColumns: Record<string, CustomColumn>;
}

export interface ProjectSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  recordCount: number;
} 