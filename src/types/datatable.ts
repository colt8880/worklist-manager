import { CustomColumn } from './project';
import { CSSProperties } from 'react';

export interface DataRecord {
  [key: string]: any;
}

export interface Styles {
  row: CSSProperties;
  cell: CSSProperties;
  header: CSSProperties;
  container: CSSProperties;
  resizeHandle: CSSProperties;
  headerCell: CSSProperties;
}

export interface DataTableProps {
  data: DataRecord[];
  columns: string[];
  customColumns: Record<string, CustomColumn>;
  onUpdateCell: (rowIndex: number, column: string, value: any) => void;
}

export interface RowProps {
  index: number;
  style: CSSProperties;
  data: DataRecord[];
  columns: string[];
  columnWidths: Record<string, number>;
  totalWidth: number;
  customColumns: Record<string, CustomColumn>;
  onUpdateCell: (rowIndex: number, column: string, value: any) => void;
} 