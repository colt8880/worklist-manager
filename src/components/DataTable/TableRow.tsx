import React from 'react';
import { styles } from './styles';
import { RowProps } from '../../types/datatable';
import { CellRenderer } from './CellRenderer';

export const TableRow: React.FC<RowProps> = ({ 
  index, 
  style, 
  data, 
  columns, 
  columnWidths, 
  totalWidth, 
  customColumns, 
  onUpdateCell 
}) => (
  <div style={{
    ...style,
    ...styles.row,
    backgroundColor: index % 2 ? '#fafafa' : '#ffffff',
    width: `${totalWidth}px`,
  }}>
    {columns.map((column) => (
      <div
        key={column}
        style={{
          ...styles.cell,
          width: `${columnWidths[column]}px`,
        }}
      >
        <CellRenderer
          rowIndex={index}
          column={column}
          value={data[index][column]}
          customColumn={customColumns[column]}
          onUpdateCell={onUpdateCell}
        />
      </div>
    ))}
  </div>
); 