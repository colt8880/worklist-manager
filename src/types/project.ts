import { DataRecord } from './index';

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  data: DataRecord[];
  columns: string[];
  userId: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  recordCount: number;
} 