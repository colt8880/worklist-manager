import { DataRecord } from './index';
import { GridColDef } from '@mui/x-data-grid';

export type ColumnType = 'string' | 'boolean' | 'singleSelect';

export interface CustomColumn extends Omit<GridColDef, 'field'> {
  name: string;
  type: ColumnType;
  options?: string[];  // For singleSelect type
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