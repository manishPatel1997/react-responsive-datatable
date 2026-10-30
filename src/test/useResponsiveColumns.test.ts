import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useResponsiveColumns } from '../lib/useResponsiveColumns';
import type { ResponsiveColumn } from '../lib/types';

describe('useResponsiveColumns Hook', () => {
  it('returns all columns as visible when columns array is provided', () => {
    const columns: ResponsiveColumn[] = [
      { id: 'col1', header: 'Column 1', minWidth: 100 },
      { id: 'col2', header: 'Column 2', minWidth: 100 },
    ];

    const containerRef = {
      current: {
        getBoundingClientRect: () => ({ width: 800, height: 400 } as DOMRect),
        clientWidth: 800,
      } as HTMLDivElement,
    };

    const { result } = renderHook(() =>
      useResponsiveColumns({ columns, containerRef })
    );

    expect(result.current.visibleColumns.length).toBe(2);
    expect(result.current.collapsedColumns.length).toBe(0);
    expect(result.current.isCollapsed).toBe(false);
  });

  it('collapses lower priority columns first when container is narrow', () => {
    const columns: ResponsiveColumn[] = [
      { id: 'name', header: 'Name', priority: 1, minWidth: 200 },
      { id: 'role', header: 'Role', priority: 2, minWidth: 150 },
      { id: 'date', header: 'Date', priority: 9, minWidth: 150 }, // Highest priority number = collapses first!
    ];

    // Total needed = 200 + 150 + 150 = 500px (+ 38px button = 538px)
    // Container = 400px -> 'date' should collapse
    const containerRef = {
      current: {
        getBoundingClientRect: () => ({ width: 400, height: 400 } as DOMRect),
        clientWidth: 400,
      } as HTMLDivElement,
    };

    const { result } = renderHook(() =>
      useResponsiveColumns({ columns, containerRef })
    );

    expect(result.current.isCollapsed).toBe(true);
    expect(result.current.collapsedColumns.map((c) => c.id)).toContain('date');
    expect(result.current.visibleColumns.map((c) => c.id)).toEqual(['name', 'role']);
  });

  it('never collapses columns marked as alwaysVisible', () => {
    const columns: ResponsiveColumn[] = [
      { id: 'actions', header: 'Actions', alwaysVisible: true, minWidth: 100 },
      { id: 'email', header: 'Email', priority: 5, minWidth: 200 },
      { id: 'phone', header: 'Phone', priority: 8, minWidth: 200 },
    ];

    // Constrained container: only 150px
    const containerRef = {
      current: {
        getBoundingClientRect: () => ({ width: 150, height: 400 } as DOMRect),
        clientWidth: 150,
      } as HTMLDivElement,
    };

    const { result } = renderHook(() =>
      useResponsiveColumns({ columns, containerRef })
    );

    // 'actions' is alwaysVisible and must stay in visibleColumns
    const visibleIds = result.current.visibleColumns.map((c) => c.id);
    expect(visibleIds).toContain('actions');
  });

  it('handles empty column list gracefully', () => {
    const containerRef = {
      current: {
        getBoundingClientRect: () => ({ width: 500, height: 400 } as DOMRect),
        clientWidth: 500,
      } as HTMLDivElement,
    };

    const { result } = renderHook(() =>
      useResponsiveColumns({ columns: [], containerRef })
    );

    expect(result.current.visibleColumns).toEqual([]);
    expect(result.current.collapsedColumns).toEqual([]);
    expect(result.current.isCollapsed).toBe(false);
  });
});
