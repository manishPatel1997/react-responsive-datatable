# Changelog

All notable changes to `react-responsive-datatable` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Column resizing**: opt-in `resizableColumns` prop adds drag-to-resize handles to headers.
- **`searchDebounceMs`**: debounce the search query commit while keeping the input instant.
- **`exportFileName`**: customize the CSV export filename.

### Fixed
- Page-size `<select>` now uses `useId()` so multiple tables on one page no longer share an `id`.
- CSV export falls back to `col.id` when a column `header` is JSX (no more `[object Object]`).

## [1.0.0] - 2026-10-30

### Initial Release 🎉
- **DataTables-Style Priority Collapse Engine**: Pure React `useResponsiveColumns` hook utilizing `ResizeObserver` for container-aware column collapsing.
- **Full Component Preservation**: Interactive React components (buttons, badges, inputs, dropdowns) retain full state and event listeners in both the primary table and collapsed child rows.
- **Zero Runtime Dependencies**: Replaced external icon libraries with lightweight inline SVGs. React and ReactDOM correctly scoped to `peerDependencies`.
- **Dynamic Framework Agnostic**: Naturally inherits design tokens (CSS variables) with first-class support for Tailwind CSS, HeroUI, shadcn/ui, or plain CSS.
- **Controlled & Uncontrolled Modes**: Added `searchQuery`/`onSearchChange`, `sortState`/`onSortChange`, `currentPage`/`onPageChange`, and `pageSize`/`onPageSizeChange` for URL-state sync and server-side operations.
- **Server-Side Capabilities**: Added `totalItems`, `manualPagination`, `manualSorting`, and `manualFiltering` props.
- **Accessibility (a11y)**: Semantic table structure with `role="region"`, `aria-sort`, `aria-expanded`, `aria-controls`, and keyboard navigation support.
- **Built-in CSV Export**: One-click data export utility.

