import { Styles } from '../../types/datatable';

export const CONSTANTS = {
  ROW_HEIGHT: 52,
  MIN_COLUMN_WIDTH: 100,
  MAX_COLUMN_WIDTH: 400,
  PADDING: 32,
  CHAR_WIDTH: 8,
  HEADER_CHAR_WIDTH: 10,
  PLACEHOLDER_COLUMN_WIDTH: 200,
};

const baseStyles: Omit<Styles, 'headerCell'> = {
  row: {
    display: 'flex',
    borderBottom: '1px solid rgba(224, 224, 224, 1)',
  },
  cell: {
    padding: '16px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    display: 'flex',
    alignItems: 'center',
  },
  header: {
    display: 'flex',
    borderBottom: '2px solid rgba(224, 224, 224, 1)',
    backgroundColor: '#fafafa',
    width: '100%',
  },
  container: {
    overflow: 'hidden',
  },
  resizeHandle: {
    position: 'absolute' as const,
    right: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    cursor: 'col-resize',
    userSelect: 'none' as const,
    backgroundColor: 'transparent',
  },
};

export const styles: Styles = {
  ...baseStyles,
  headerCell: {
    ...baseStyles.cell,
    position: 'relative' as const,
    fontWeight: 'bold',
  },
}; 