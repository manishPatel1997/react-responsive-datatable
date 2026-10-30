import React from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface ResponsiveColumn<T = any, V = any> {
  id: string;
  header: React.ReactNode;
  /**
   * Accessor key or function to get cell value
   */
  accessor?: keyof T | ((row: T) => V);
  /**
   * Priority for responsive hiding:
   * 1 = Highest priority (stays visible longest)
   * 2, 3, 4, ... = Lower priority (collapses earlier as screen shrinks)
   * Note: Convention matches DataTables (Priority 1 is most important).
   * Default is 10
   */
  priority?: number;
  /**
   * Approximate or minimum width in pixels needed by this column
   * (Default: 110px)
   */
  minWidth?: number;
  /**
   * If true, this column is never hidden in the main row
   */
  alwaysVisible?: boolean;
  /**
   * Enable/disable sorting on this column (Default: true)
   */
  sortable?: boolean;
  /**
   * Enable/disable searching on this column (Default: true)
   */
  searchable?: boolean;
  /**
   * Custom CSS class name for <th> and <td> (Supports any framework/Tailwind utility classes)
   */
  className?: string;
  /**
   * Custom React component renderer for the table cell
   * Supports interactive components (buttons, badges, inputs, etc.)
   */
  render?: (
    value: V,
    row: T,
    index: number,
    isCollapsedView: boolean
  ) => React.ReactNode;
  /**
   * Optional custom renderer specifically for the child/collapsed details view
   */
  renderDetail?: (
    value: V,
    row: T,
    index: number
  ) => React.ReactNode;
}

/**
 * Dynamic Slot Class Names
 * Allows granular customization of every table element using any CSS utility classes or custom styles.
 */
export interface TableClassNames {
  root?: string;
  toolbar?: string;
  toolbarLeft?: string;
  toolbarRight?: string;
  title?: string;
  lengthMenu?: string;
  select?: string;
  searchBox?: string;
  searchInput?: string;
  exportButton?: string;
  responsiveBadge?: string;
  tableWrapper?: string;
  table?: string;
  thead?: string;
  th?: string;
  tbody?: string;
  tr?: string;
  td?: string;
  controlTh?: string;
  controlTd?: string;
  expandButton?: string;
  childRow?: string;
  childCell?: string;
  detailsList?: string;
  detailsItem?: string;
  detailTitle?: string;
  detailData?: string;
  resizeHandle?: string;
  footer?: string;
  pagination?: string;
  pageButton?: string;
  pageButtonActive?: string;
  infoText?: string;
}

/**
 * Optional custom icon components map to override default SVG icons
 */
export interface TableIcons {
  chevronUp?: React.ReactNode;
  chevronDown?: React.ReactNode;
  chevronsUpDown?: React.ReactNode;
  search?: React.ReactNode;
  plus?: React.ReactNode;
  minus?: React.ReactNode;
  chevronLeft?: React.ReactNode;
  chevronRight?: React.ReactNode;
  download?: React.ReactNode;
  eye?: React.ReactNode;
  checkCircle?: React.ReactNode;
}

export interface ResponsiveTableProps<T = any> {
  data: T[];
  columns: ResponsiveColumn<T>[];
  keyField?: keyof T | ((row: T, index: number) => string | number);
  /**
   * Table Title or Header text
   */
  title?: React.ReactNode;
  /**
   * Accessible label for the table
   */
  tableAriaLabel?: string;
  /**
   * Enable search input filter (Default: true)
   */
  searchable?: boolean;
  searchPlaceholder?: string;
  /**
   * Debounce (ms) before a typed search query is committed to filtering /
   * onSearchChange. 0 (default) commits immediately. The input itself always
   * updates instantly.
   */
  searchDebounceMs?: number;
  /**
   * Controlled search query
   */
  searchQuery?: string;
  /**
   * Callback fired when search query changes (enables URL sync or server-side search)
   */
  onSearchChange?: (query: string) => void;
  /**
   * Enable pagination (Default: true)
   */
  pagination?: boolean;
  /**
   * Page size (Controlled or default)
   */
  pageSize?: number;
  pageSizeOptions?: number[];
  /**
   * Callback fired when page size changes
   */
  onPageSizeChange?: (pageSize: number) => void;
  /**
   * Current active page (1-based, controlled)
   */
  currentPage?: number;
  /**
   * Callback fired when page changes
   */
  onPageChange?: (page: number) => void;
  /**
   * Total items count (for server-side pagination)
   * If provided, pagination calculations use this instead of data.length
   */
  totalItems?: number;
  /**
   * When true, disables internal client-side slicing (for server-side data fetching)
   */
  manualPagination?: boolean;
  /**
   * When true, disables internal client-side sorting (for server-side data fetching)
   */
  manualSorting?: boolean;
  /**
   * When true, disables internal client-side filtering (for server-side data fetching)
   */
  manualFiltering?: boolean;
  /**
   * Enable sorting (Default: true)
   */
  sortable?: boolean;
  defaultSort?: SortState;
  /**
   * Controlled sort state
   */
  sortState?: SortState | null;
  /**
   * Callback fired when sort changes
   */
  onSortChange?: (sortState: SortState | null) => void;
  /**
   * Controlled expanded row IDs
   */
  expandedRowIds?: Set<string | number>;
  /**
   * Callback fired when expanded rows change
   */
  onRowExpandChange?: (expandedRowIds: Set<string | number>) => void;
  /**
   * Custom icons to override default SVGs
   */
  icons?: TableIcons;
  /**
   * If true, removes all default styling and classes so your project's styles have 100% control
   */
  unstyled?: boolean;
  /**
   * Granular slot class names for dynamic customization
   */
  classNames?: TableClassNames;
  /**
   * Striped alternating row backgrounds (Default: true)
   */
  striped?: boolean;
  /**
   * Hover highlight for rows (Default: true)
   */
  hoverable?: boolean;
  /**
   * Bordered cells (Default: false)
   */
  bordered?: boolean;
  /**
   * Custom empty state component
   */
  emptyState?: React.ReactNode;
  /**
   * Custom toolbar actions/buttons (Export, New Item, etc.)
   */
  toolbarActions?: React.ReactNode;
  /**
   * Enable drag-to-resize handles on column headers (Default: false)
   */
  resizableColumns?: boolean;
  /**
   * Filename for the CSV export (Default: 'datatable_export.csv')
   */
  exportFileName?: string;
  /**
   * Enable clicking the entire row to toggle collapsed details
   */
  expandOnRowClick?: boolean;
  /**
   * Optional custom row details renderer (overrides standard key-value display)
   */
  renderCustomDetails?: (
    row: T,
    collapsedColumns: ResponsiveColumn<T>[]
  ) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onRowClick?: (row: T, index: number) => void;
}
