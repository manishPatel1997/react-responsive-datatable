import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { ResponsiveColumn } from './types';

const CONTROL_COLUMN_WIDTH = 38; // Width reserved for the expand/collapse '+' button column
const DEFAULT_MIN_COLUMN_WIDTH = 90;

interface UseResponsiveColumnsOptions<T> {
  columns: ResponsiveColumn<T>[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  tableRef?: React.RefObject<HTMLTableElement | null>;
  contentDependency?: any;
}

export function useResponsiveColumns<T>({
  columns,
  containerRef,
  tableRef,
  contentDependency,
}: UseResponsiveColumnsOptions<T>) {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [intrinsicWidths, setIntrinsicWidths] = useState<Record<string, number>>({});
  const [overflowAdjustment, setOverflowAdjustment] = useState<number>(0);
  const headerInnerRefs = useRef<Record<string, HTMLElement | null>>({});

  // Register the inner content element of the header (which does NOT stretch with table width)
  const registerHeaderRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) {
      headerInnerRefs.current[id] = el;
    } else {
      delete headerInnerRefs.current[id];
    }
  }, []);

  // Set up ResizeObserver to observe container width changes in real time
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0) {
        setContainerWidth(Math.floor(rect.width));
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });

    resizeObserver.observe(container);
    window.addEventListener('resize', updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, [containerRef]);

  // Compute stable intrinsic minimum widths for each column
  useEffect(() => {
    const measured: Record<string, number> = {};
    let hasUpdates = false;

    columns.forEach((col) => {
      // 1. Explicit minWidth takes highest priority
      if (col.minWidth) {
        measured[col.id] = col.minWidth;
        return;
      }

      // 2. Measure the inner element (which has display: inline-flex and does NOT stretch)
      const innerEl = headerInnerRefs.current[col.id];
      if (innerEl) {
        const contentWidth = Math.ceil(innerEl.scrollWidth) + 24;
        measured[col.id] = Math.max(contentWidth, DEFAULT_MIN_COLUMN_WIDTH);
        if (intrinsicWidths[col.id] !== measured[col.id]) {
          hasUpdates = true;
        }
      } else {
        measured[col.id] = intrinsicWidths[col.id] || DEFAULT_MIN_COLUMN_WIDTH;
      }
    });

    if (hasUpdates) {
      setIntrinsicWidths((prev) => ({ ...prev, ...measured }));
    }
  }, [columns, intrinsicWidths]);

  // Calculate visible vs collapsed columns using DataTables priority algorithm
  const { visibleColumns, collapsedColumns, isCollapsed } = useMemo(() => {
    if (!containerWidth || columns.length === 0) {
      return {
        visibleColumns: columns,
        collapsedColumns: [] as ResponsiveColumn<T>[],
        isCollapsed: false,
      };
    }

    // Get stable required width for each column
    const getColWidth = (col: ResponsiveColumn<T>) =>
      col.minWidth || intrinsicWidths[col.id] || DEFAULT_MIN_COLUMN_WIDTH;

    // Total needed width + dynamic overflow adjustment (if detected from DOM)
    const baseNeededWidth = columns.reduce((acc, col) => acc + getColWidth(col), 0);
    const totalNeededWidth = baseNeededWidth + overflowAdjustment;

    // If all columns fit inside the container, NO columns collapse!
    if (totalNeededWidth <= containerWidth) {
      return {
        visibleColumns: columns,
        collapsedColumns: [] as ResponsiveColumn<T>[],
        isCollapsed: false,
      };
    }

    // Prepare priority sorting:
    // Columns are sorted by collapse eagerness:
    // 1. Non-alwaysVisible first
    // 2. Highest priority number first (e.g. 9 collapses before 2)
    // 3. Rightmost column (higher index) collapses first for equal priorities
    const candidates = columns.map((col, index) => ({
      col,
      index,
      priority: col.priority ?? 10,
      width: getColWidth(col),
      alwaysVisible: !!col.alwaysVisible,
    }));

    const sortedToCollapse = [...candidates].sort((a, b) => {
      if (a.alwaysVisible !== b.alwaysVisible) {
        return a.alwaysVisible ? 1 : -1; // alwaysVisible is kept till the end
      }
      if (b.priority !== a.priority) {
        return b.priority - a.priority; // higher priority number collapses first
      }
      return b.index - a.index; // rightmost column collapses first
    });

    const collapsedSet = new Set<string>();
    // When at least one column collapses, we also need room for the '+' control button
    let currentTotalWidth = totalNeededWidth + CONTROL_COLUMN_WIDTH;

    for (const item of sortedToCollapse) {
      // Do not collapse alwaysVisible columns
      if (item.alwaysVisible) continue;

      // Stop once remaining columns fit within containerWidth
      if (currentTotalWidth <= containerWidth) {
        break;
      }

      // Always keep at least 1 primary column visible
      const remainingCount = columns.length - collapsedSet.size;
      if (remainingCount <= 1) {
        break;
      }

      // Collapse this column
      collapsedSet.add(item.col.id);
      currentTotalWidth -= item.width;
    }

    const visible = columns.filter((col) => !collapsedSet.has(col.id));
    const collapsed = columns.filter((col) => collapsedSet.has(col.id));

    return {
      visibleColumns: visible,
      collapsedColumns: collapsed,
      isCollapsed: collapsed.length > 0,
    };
  }, [columns, containerWidth, intrinsicWidths, overflowAdjustment]);

  // Real-time Table Overflow Protection:
  // If the rendered table physically overflows the container,
  // automatically increase overflowAdjustment so the next column is cleanly collapsed into '+' details!
  useEffect(() => {
    const tableEl = tableRef?.current;
    const containerEl = containerRef.current;
    if (!tableEl || !containerEl) return;

    const checkOverflow = () => {
      const wrapperEl = tableEl.parentElement;
      const containerW = wrapperEl ? wrapperEl.clientWidth : containerEl.clientWidth;
      const tableW = tableEl.scrollWidth;

      if (containerW > 0 && tableW > containerW) {
        // Table is physically overflowing container!
        const delta = tableW - containerW;
        setOverflowAdjustment((prev) => prev + delta + 30);
      } else if (containerW > 0 && containerW > tableW + 80 && overflowAdjustment > 0) {
        // Container has grown large enough, reset adjustment
        setOverflowAdjustment(0);
      }
    };

    const timer = setTimeout(checkOverflow, 40);

    const observer = new ResizeObserver(() => {
      checkOverflow();
    });
    observer.observe(tableEl);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [tableRef, containerRef, containerWidth, visibleColumns.length, overflowAdjustment, contentDependency]);

  return {
    containerWidth,
    visibleColumns,
    collapsedColumns,
    isCollapsed,
    registerHeaderRef,
  };
}
