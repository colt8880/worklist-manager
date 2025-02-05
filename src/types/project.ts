import { DataRecord } from './index';

export type ColumnType = 'checkbox' | 'select' | 'text';

export interface CustomColumn {
  name: string;
  type: ColumnType;
  helperText: string;
  options?: string[];  // For select type columns
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  data: DataRecord[];
  columns: string[];
  customColumns: Record<string, CustomColumn>;
  userId: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  recordCount: number;
} 