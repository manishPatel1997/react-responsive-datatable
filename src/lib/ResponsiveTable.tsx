import React, { useState, useMemo, useRef, useCallback, useId } from 'react';
import type { ResponsiveTableProps, ResponsiveColumn, SortState } from './types';
import { useResponsiveColumns } from './useResponsiveColumns';
import {
  IconChevronUp,
  IconChevronDown,
  IconChevronsUpDown,
  IconSearch,
  IconPlus,
  IconMinus,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconEye,
  IconCheckCircle,
} from './icons';
import './responsive-table.css';

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  title,
  tableAriaLabel,
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchDebounceMs = 0,
  searchQuery: controlledSearchQuery,
  onSearchChange,
  pagination = true,
  pageSize: propPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  onPageSizeChange,
  currentPage: controlledCurrentPage,
  onPageChange,
  totalItems: customTotalItems,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  sortable = true,
  defaultSort,
  sortState: controlledSortState,
  onSortChange,
  expandedRowIds: controlledExpandedRowIds,
  onRowExpandChange,
  icons,
  unstyled = false,
  classNames = {},
  striped = true,
  hoverable = true,
  bordered = false,
  emptyState,
  toolbarActions,
  resizableColumns = false,
  exportFileName = 'datatable_export.csv',
  expandOnRowClick = false,
  renderCustomDetails,
  className = '',
  style,
  onRowClick,
}: ResponsiveTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const instanceId = useId();

  // State: expanded rows (supports both controlled & uncontrolled)
  const [internalExpandedRowIds, setInternalExpandedRowIds] = useState<Set<string | number>>(
    new Set()
  );
  const expandedRowIds = controlledExpandedRowIds ?? internalExpandedRowIds;

  // State: global search query (supports both controlled & uncontrolled)
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery = controlledSearchQuery ?? internalSearchQuery;

  // Instant text-field display value, decoupled from the (possibly debounced)
  // committed query used for filtering.
  const [searchInput, setSearchInput] = useState(controlledSearchQuery ?? '');
  const [prevControlledSearchQuery, setPrevControlledSearchQuery] = useState(controlledSearchQuery);
  if (controlledSearchQuery !== undefined && controlledSearchQuery !== prevControlledSearchQuery) {
    setPrevControlledSearchQuery(controlledSearchQuery);
    setSearchInput(controlledSearchQuery);
  }
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  // State: per-column pixel widths set via drag-to-resize (id -> width)
  const [colWidths, setColWidths] = useState<Record<string, number>>({});

  // State: sorting (supports both controlled & uncontrolled)
  const [internalSortState, setInternalSortState] = useState<SortState | null>(
    defaultSort || null
  );
  const sortState = controlledSortState !== undefined ? controlledSortState : internalSortState;

  // State: pagination (supports both controlled & uncontrolled)
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const currentPage = controlledCurrentPage ?? internalCurrentPage;

  const [internalPageSize, setInternalPageSize] = useState(propPageSize);
  const pageSize = propPageSize !== undefined && onPageSizeChange ? propPageSize : internalPageSize;

  // Responsive column calculation engine
  const {
    visibleColumns,
    collapsedColumns,
    isCollapsed,
    registerHeaderRef,
    containerWidth,
  } = useResponsiveColumns({
    columns,
    containerRef,
    tableRef,
    contentDependency: [data.length, pageSize, currentPage, searchQuery],
  });

  // Helper to extract row unique key
  const getRowKey = useCallback(
    (row: T, index: number): string | number => {
      if (typeof keyField === 'function') {
        return keyField(row, index);
      }
      if (keyField && row[keyField] !== undefined) {
        return row[keyField];
      }
      return row.id !== undefined ? row.id : index;
    },
    [keyField]
  );

  // Helper to extract cell raw value
  const getCellValue = useCallback(
    (row: T, col: ResponsiveColumn<T>) => {
      if (typeof col.accessor === 'function') {
        return col.accessor(row);
      }
      if (typeof col.accessor === 'string' && col.accessor in row) {
        return row[col.accessor];
      }
      if (col.id in row) {
        return row[col.id];
      }
      return undefined;
    },
    []
  );

  // Row expand toggle
  const toggleRowExpanded = useCallback(
    (rowKey: string | number) => {
      const next = new Set(expandedRowIds);
      if (next.has(rowKey)) {
        next.delete(rowKey);
      } else {
        next.add(rowKey);
      }

      if (onRowExpandChange) {
        onRowExpandChange(next);
      }
      if (controlledExpandedRowIds === undefined) {
        setInternalExpandedRowIds(next);
      }
    },
    [expandedRowIds, onRowExpandChange, controlledExpandedRowIds]
  );

  // Commit a search value to filtering / callbacks and reset to page 1
  const commitSearch = useCallback(
    (value: string) => {
      if (onSearchChange) {
        onSearchChange(value);
      }
      if (controlledSearchQuery === undefined) {
        setInternalSearchQuery(value);
      }
      if (onPageChange) {
        onPageChange(1);
      }
      if (controlledCurrentPage === undefined) {
        setInternalCurrentPage(1);
      }
    },
    [onSearchChange, controlledSearchQuery, onPageChange, controlledCurrentPage]
  );

  // Search input handler: update the field instantly, debounce the commit if asked
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchDebounceMs > 0) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => commitSearch(value), searchDebounceMs);
    } else {
      commitSearch(value);
    }
  };

  // Drag-to-resize: set an explicit px width for a column while dragging its handle.
  // ponytail: pointer-only + visual-only (resized widths don't feed the collapse
  // engine); add keyboard resize / collapse-aware widths only if users ask.
  const handleResizeStart = (e: React.PointerEvent, colId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const th = (e.currentTarget as HTMLElement).closest('th') as HTMLElement | null;
    const col = columns.find((c) => c.id === colId);
    const min = col?.minWidth ?? 60;
    const startX = e.clientX;
    const startWidth = colWidths[colId] ?? th?.offsetWidth ?? min;

    const onMove = (ev: PointerEvent) => {
      const next = Math.max(min, startWidth + (ev.clientX - startX));
      setColWidths((prev) => ({ ...prev, [colId]: next }));
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Filter data based on search query (unless manualFiltering is enabled)
  const filteredData = useMemo(() => {
    if (manualFiltering || !searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    const searchableColumns = columns.filter((c) => c.searchable !== false);

    return data.filter((row) => {
      return searchableColumns.some((col) => {
        const val = getCellValue(row, col);
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [data, columns, searchQuery, getCellValue, manualFiltering]);

  // Sort filtered data (unless manualSorting is enabled)
  const sortedData = useMemo(() => {
    if (manualSorting || !sortState) return filteredData;

    const targetCol = columns.find((c) => c.id === sortState.columnId);
    if (!targetCol) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = getCellValue(a, targetCol);
      const valB = getCellValue(b, targetCol);

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else {
        comparison = String(valA).localeCompare(String(valB));
      }

      return sortState.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortState, columns, getCellValue, manualSorting]);

  // Pagination calculation
  const totalItems = customTotalItems !== undefined ? customTotalItems : sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedData = useMemo(() => {
    if (!pagination || manualPagination) return sortedData;
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, safeCurrentPage, pageSize, pagination, manualPagination]);

  // Column sort click handler
  const handleSort = (columnId: string, colSortable?: boolean) => {
    if (!sortable || colSortable === false) return;

    let nextSort: SortState | null = null;
    if (sortState?.columnId === columnId) {
      if (sortState.direction === 'asc') {
        nextSort = { columnId, direction: 'desc' };
      } else {
        nextSort = null; // Reset to unsorted on third click
      }
    } else {
      nextSort = { columnId, direction: 'asc' };
    }

    if (onSortChange) {
      onSortChange(nextSort);
    }
    if (controlledSortState === undefined) {
      setInternalSortState(nextSort);
    }
  };

  // Page change handler
  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
    if (controlledCurrentPage === undefined) {
      setInternalCurrentPage(newPage);
    }
  };

  // Page size change handler
  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
    if (propPageSize === undefined || !onPageSizeChange) {
      setInternalPageSize(newSize);
    }
    handlePageChange(1);
  };

  // CSV Export utility
  const handleExportCSV = () => {
    // col.header may be JSX; fall back to col.id so we never emit "[object Object]"
    const headers = columns.map((col) => {
      const label = typeof col.header === 'string' ? col.header : col.id;
      return `"${label.replace(/"/g, '""')}"`;
    });
    const rows = sortedData.map((row) =>
      columns
        .map((col) => {
          const val = getCellValue(row, col);
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Class resolver helper (combines default styles unless unstyled, plus custom classes)
  const cls = (defaultClass: string, customClass?: string) => {
    if (unstyled) return customClass || '';
    return customClass ? `${defaultClass} ${customClass}` : defaultClass;
  };

  return (
    <div
      ref={containerRef}
      style={style}
      className={cls(`rdt-root-container ${className}`.trim(), classNames.root)}
      role="region"
      aria-label={tableAriaLabel || (typeof title === 'string' ? title : 'Data Table')}
    >
      {/* Table Toolbar */}
      <div className={cls('rdt-toolbar', classNames.toolbar)}>
        <div className={cls('rdt-toolbar-left', classNames.toolbarLeft)}>
          {title && (
            <div className={cls('', classNames.title)} style={{ fontWeight: 600, fontSize: 16 }}>
              {title}
            </div>
          )}

          {pagination && (
            <div className={cls('rdt-length-menu', classNames.lengthMenu)}>
              <label htmlFor={`${instanceId}-pagesize`}>Show</label>
              <select
                id={`${instanceId}-pagesize`}
                className={cls('rdt-select', classNames.select)}
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                aria-label="Select page size"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span>entries</span>
            </div>
          )}

          {isCollapsed ? (
            <div
              className={cls('rdt-responsive-badge', classNames.responsiveBadge)}
              title={`Container width: ${containerWidth}px`}
              aria-live="polite"
            >
              {icons?.eye || <IconEye size={12} />}
              <span>{collapsedColumns.length} hidden</span>
            </div>
          ) : (
            <div
              className={cls('rdt-responsive-badge', classNames.responsiveBadge)}
              style={unstyled ? undefined : { background: 'var(--rdt-surface)', color: 'var(--rdt-primary)', border: '1px solid var(--rdt-border)' }}
              title={`Container width: ${containerWidth}px`}
              aria-live="polite"
            >
              {icons?.checkCircle || <IconCheckCircle size={12} />}
              <span>All columns visible</span>
            </div>
          )}
        </div>

        <div className={cls('rdt-toolbar-right', classNames.toolbarRight)}>
          {toolbarActions}

          <button
            type="button"
            className={cls('rdt-page-btn', classNames.exportButton)}
            onClick={handleExportCSV}
            title="Export CSV"
            aria-label="Export table to CSV"
          >
            {icons?.download || <IconDownload size={14} style={{ marginRight: 4 }} />}
            <span>CSV</span>
          </button>

          {searchable && (
            <div className={cls('rdt-search-box', classNames.searchBox)}>
              <span className="rdt-search-icon" aria-hidden="true">
                {icons?.search || <IconSearch size={14} />}
              </span>
              <input
                type="text"
                className={cls('rdt-search-input', classNames.searchInput)}
                placeholder={searchPlaceholder}
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                aria-label={searchPlaceholder}
              />
            </div>
          )}
        </div>
      </div>

      {/* Table Element */}
      <div className={cls(`rdt-table-wrapper ${bordered && !unstyled ? 'rdt-bordered' : ''}`, classNames.tableWrapper)}>
        <table className={cls('rdt-table', classNames.table)} ref={tableRef}>
          <thead className={cls('rdt-thead', classNames.thead)}>
            <tr>
              {/* Responsive Expand/Collapse Control Column Header */}
              {isCollapsed && (
                <th
                  className={cls('rdt-th rdt-control-th', classNames.controlTh)}
                  aria-label="Row expand control"
                  scope="col"
                />
              )}

              {/* Visible Column Headers */}
              {visibleColumns.map((col) => {
                const isSortable = sortable && col.sortable !== false;
                const isSorted = sortState?.columnId === col.id;
                const direction = isSorted ? sortState.direction : null;

                return (
                  <th
                    key={col.id}
                    className={cls(
                      `rdt-th ${isSortable && !unstyled ? 'rdt-th-sortable' : ''} ${col.className || ''}`,
                      classNames.th
                    )}
                    onClick={() => handleSort(col.id, col.sortable)}
                    onKeyDown={(e) => {
                      if (isSortable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleSort(col.id, col.sortable);
                      }
                    }}
                    tabIndex={isSortable ? 0 : undefined}
                    role={isSortable ? 'button' : undefined}
                    aria-sort={
                      isSorted
                        ? direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : isSortable
                        ? 'none'
                        : undefined
                    }
                    scope="col"
                    style={{
                      minWidth: col.minWidth ? `${col.minWidth}px` : undefined,
                      width: colWidths[col.id] ? `${colWidths[col.id]}px` : undefined,
                      position: resizableColumns ? 'relative' : undefined,
                    }}
                  >
                    <div
                      className="rdt-th-inner"
                      ref={(el) => registerHeaderRef(col.id, el)}
                    >
                      <span>{col.header}</span>
                      {isSortable && (
                        <span
                          className={`rdt-sort-indicator ${
                            isSorted ? 'active' : ''
                          }`}
                          aria-hidden="true"
                        >
                          {direction === 'asc' ? (
                            icons?.chevronUp || <IconChevronUp size={14} />
                          ) : direction === 'desc' ? (
                            icons?.chevronDown || <IconChevronDown size={14} />
                          ) : (
                            icons?.chevronsUpDown || <IconChevronsUpDown size={13} />
                          )}
                        </span>
                      )}
                    </div>
                    {resizableColumns && (
                      <span
                        className={cls('rdt-resize-handle', classNames.resizeHandle)}
                        onPointerDown={(e) => handleResizeStart(e, col.id)}
                        onClick={(e) => e.stopPropagation()}
                        role="separator"
                        aria-orientation="vertical"
                        aria-label={`Resize column`}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className={cls('rdt-tbody', classNames.tbody)}>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + (isCollapsed ? 1 : 0)}
                  className={cls('rdt-empty-state', classNames.td)}
                >
                  {emptyState || 'No matching records found'}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const rowKey = getRowKey(row, rowIndex);
                const isExpanded = expandedRowIds.has(rowKey);
                const childRowId = `rdt-child-${rowKey}`;

                return (
                  <React.Fragment key={rowKey}>
                    <tr
                      className={cls(
                        `rdt-row ${
                          striped && !unstyled ? 'rdt-row-striped' : ''
                        } ${hoverable && !unstyled ? 'rdt-row-hoverable' : ''} ${
                          isExpanded && !unstyled ? 'rdt-row-expanded' : ''
                        }`,
                        classNames.tr
                      )}
                      aria-expanded={isCollapsed ? isExpanded : undefined}
                      onClick={() => {
                        if (expandOnRowClick && isCollapsed) {
                          toggleRowExpanded(rowKey);
                        }
                        if (onRowClick) {
                          onRowClick(row, rowIndex);
                        }
                      }}
                      style={{
                        cursor: expandOnRowClick && isCollapsed ? 'pointer' : 'default',
                      }}
                    >
                      {/* Responsive Child Toggle Button Cell */}
                      {isCollapsed && (
                        <td
                          className={cls('rdt-td rdt-control-td', classNames.controlTd)}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpanded(rowKey);
                          }}
                        >
                          <button
                            type="button"
                            className={cls(
                              `rdt-expand-btn ${isExpanded ? 'is-expanded' : ''}`,
                              classNames.expandButton
                            )}
                            aria-expanded={isExpanded}
                            aria-controls={childRowId}
                            aria-label={isExpanded ? 'Collapse row details' : 'Expand row details'}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleRowExpanded(rowKey);
                              }
                            }}
                          >
                            {isExpanded
                              ? icons?.minus || <IconMinus size={12} strokeWidth={3} />
                              : icons?.plus || <IconPlus size={12} strokeWidth={3} />}
                          </button>
                        </td>
                      )}

                      {/* Visible Column Cells */}
                      {visibleColumns.map((col) => {
                        const rawValue = getCellValue(row, col);

                        return (
                          <td
                            key={col.id}
                            className={cls(`rdt-td ${col.className || ''}`, classNames.td)}
                          >
                            {col.render
                              ? col.render(rawValue, row, rowIndex, false)
                              : rawValue ?? '—'}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Responsive Collapsed Child Row (DataTables .dtr-details) */}
                    {isCollapsed && isExpanded && (
                      <tr
                        id={childRowId}
                        className={cls('rdt-child-row', classNames.childRow)}
                      >
                        <td
                          colSpan={visibleColumns.length + 1}
                          className={cls('rdt-child-cell', classNames.childCell)}
                        >
                          {renderCustomDetails ? (
                            renderCustomDetails(row, collapsedColumns)
                          ) : (
                            <ul className={cls('rdt-details-list', classNames.detailsList)}>
                              {collapsedColumns.map((col) => {
                                const rawValue = getCellValue(row, col);

                                return (
                                  <li
                                    key={col.id}
                                    className={cls('rdt-details-item', classNames.detailsItem)}
                                  >
                                    <span className={cls('rdt-detail-title', classNames.detailTitle)}>
                                      {col.header}:
                                    </span>
                                    <div className={cls('rdt-detail-data', classNames.detailData)}>
                                      {col.renderDetail
                                        ? col.renderDetail(rawValue, row, rowIndex)
                                        : col.render
                                        ? col.render(rawValue, row, rowIndex, true)
                                        : rawValue ?? '—'}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer: Summary & Pagination */}
      {pagination && (
        <div className={cls('rdt-footer-bar', classNames.footer)}>
          <div
            className={cls('rdt-info-text', classNames.infoText)}
            aria-live="polite"
          >
            {totalItems > 0 ? (
              <>
                Showing {(safeCurrentPage - 1) * pageSize + 1} to{' '}
                {Math.min(safeCurrentPage * pageSize, totalItems)} of {totalItems}{' '}
                entries
                {filteredData.length !== data.length &&
                  !manualFiltering &&
                  ` (filtered from ${data.length} total entries)`}
              </>
            ) : (
              'Showing 0 to 0 of 0 entries'
            )}
          </div>

          <div className={cls('rdt-pagination', classNames.pagination)}>
            <button
              type="button"
              className={cls('rdt-page-btn', classNames.pageButton)}
              disabled={safeCurrentPage <= 1}
              onClick={() => handlePageChange(Math.max(1, safeCurrentPage - 1))}
              aria-label="Previous page"
            >
              {icons?.chevronLeft || <IconChevronLeft size={14} />}
            </button>

            {/* Pagination numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - safeCurrentPage) <= 1
                );
              })
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && page - prev > 1;
                const isActive = safeCurrentPage === page;

                return (
                  <React.Fragment key={page}>
                    {showEllipsis && <span style={{ padding: '0 4px' }} aria-hidden="true">…</span>}
                    <button
                      type="button"
                      className={cls(
                        `rdt-page-btn ${isActive ? 'active' : ''}`,
                        isActive ? classNames.pageButtonActive || classNames.pageButton : classNames.pageButton
                      )}
                      onClick={() => handlePageChange(page)}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={`Page ${page}`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              type="button"
              className={cls('rdt-page-btn', classNames.pageButton)}
              disabled={safeCurrentPage >= totalPages}
              onClick={() => handlePageChange(Math.min(totalPages, safeCurrentPage + 1))}
              aria-label="Next page"
            >
              {icons?.chevronRight || <IconChevronRight size={14} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
