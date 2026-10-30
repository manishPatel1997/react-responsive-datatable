# ⚡ React Responsive DataTable (`react-responsive-datatable`)

> The lightest **full-featured** React & Next.js data table — search, sort, pagination, and server-side mode out of the box — with **automatic responsive column collapsing** so dense tables stay readable from 320px mobile to 4K. **Zero dependencies, zero jQuery.**

[![CI](https://github.com/UDAN/react-responsive-datatable/actions/workflows/ci.yml/badge.svg)](https://github.com/UDAN/react-responsive-datatable/actions/workflows/ci.yml)
![React 18 & 19 Ready](https://img.shields.io/badge/React-18%20%26%2019-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-green)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success)
![Bundle](https://img.shields.io/badge/gzipped-~8.3%20KB-success)
![Tests Passing](https://img.shields.io/badge/Tests-15%2F15%20Passing-brightgreen)
![License](https://img.shields.io/badge/License-MIT-orange)

<!-- Deploy the demo app (npm run build) to Vercel/Netlify, then swap the URL below. -->
**▶ [Live Demo](https://your-demo-url.example.com)** · try the responsive collapsing and resize slider before installing.

---

## ✨ What You Get

A complete table component — not a migration shim. Everything below ships in ~8.3 KB gzipped (JS + CSS) with no runtime dependencies:

* **Core features** — global search, multi-state sorting, pagination with page-size control, and row expansion, all client-side by default.
* **Server-side mode** — flip on `manualPagination` / `manualSorting` / `manualFiltering` with controlled callbacks to power admin dashboards backed by REST or GraphQL APIs.
* **Automatic responsive collapsing** — lower-priority columns fold into an expandable child row as space shrinks, so you never force horizontal scroll (the "superpower" most React tables lack).
* **Live React component cells** — render interactive buttons, badges, menus, and forms in cells *and* inside collapsed rows, with state and events fully intact.
* **Style-agnostic & headless** — inherits your Tailwind / shadcn / CSS-variable tokens, or run fully unstyled.

---

## 🔍 Why Reverse-Engineer DataTables Responsive?

The responsive collapsing above is modeled on [DataTables Responsive](https://datatables.net/extensions/responsive/), long the gold standard for this UX — rebuilt natively so it works in modern React without the baggage.

DataTables' responsive column collapsing (priority → hide → expand into child row) is the gold standard UX for dense tabular data on variable-width screens:
1. When screen space shrinks, columns don't force awkward horizontal scrolling.
2. Instead, lower-priority columns **automatically collapse** into an expandable child row (`+` / `-` toggle).
3. Data is never lost, maintaining clean readability on both 320px mobile viewports and 4K ultra-wide monitors.

### The Problem with DataTables in Modern React / Next.js
* **jQuery DOM Mutation**: Original DataTables directly modifies the DOM, conflicting with React's Virtual DOM reconciliation.
* **Component Serialization Loss**: When DataTables collapses a column into a child row, it clones static HTML strings. Any interactive React components (buttons, dropdowns, forms, modals, tooltips) lose their state, event listeners, and React context.
* **Heavyweight**: Requires jQuery (~80KB+) and imperative setup scripts.
* **Next.js Incompatibility**: Causes hydration mismatches and breaks React Server Components (RSC).

### How This Re-Engineered Architecture Solves It
* **100% Native React 18/19 & TypeScript**: Built from scratch using modern React hooks and standard JSX rendering.
* **Dynamic Priority Engine (`useResponsiveColumns`)**: Employs `ResizeObserver` to monitor actual container width (not just window width). Automatically prioritizes and collapses columns without DOM hacking.
* **First-Class React Component Cells**: Render arbitrary React components (interactive buttons, badges, star ratings, progress bars, avatars) in table cells **and** within collapsed child rows. All React state, clicks, and animations remain 100% active!
* **Zero Runtime Dependencies**: No jQuery, no icon libraries. All icons are lightweight, standalone inline SVGs; the whole package is ~8.3 KB gzipped (JS + CSS).
* **Controlled & Uncontrolled Modes**: Sync table state (search query, sorting, pagination, expanded rows) directly with URL parameters or server-side APIs.
* **Framework Agnostic**: Inherits typography, borders, and colors naturally from your project (Tailwind CSS, HeroUI, shadcn/ui, Bootstrap, CSS Modules, or Vanilla CSS).

---

## 🚀 Quick Start

### 1. Installation

```bash
npm install react-responsive-datatable
```

### 2. Import Component and Styles

```tsx
import { ResponsiveTable, type ResponsiveColumn } from 'react-responsive-datatable';
import 'react-responsive-datatable/styles.css';
```

---

## 💻 Basic Example

```tsx
import React, { useState } from 'react';
import { ResponsiveTable, type ResponsiveColumn } from 'react-responsive-datatable';
import 'react-responsive-datatable/styles.css';

interface User {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Pending' | 'Inactive';
  salary: number;
  joinDate: string;
}

const USERS: User[] = [
  { id: '1', name: 'Alice Smith', role: 'Staff Engineer', status: 'Active', salary: 160000, joinDate: '2021-04-12' },
  { id: '2', name: 'Bob Johnson', role: 'Product Manager', status: 'Pending', salary: 140000, joinDate: '2022-09-01' },
];

export function UserTable() {
  const [data, setData] = useState<User[]>(USERS);

  const columns: ResponsiveColumn<User>[] = [
    {
      id: 'name',
      header: 'Full Name',
      priority: 1, // Highest priority: Never collapses
      alwaysVisible: true,
      minWidth: 160,
      render: (val, row) => <strong>{row.name}</strong>,
    },
    {
      id: 'status',
      header: 'Status',
      priority: 2,
      minWidth: 100,
      render: (val, row) => (
        <span style={{ padding: '4px 8px', borderRadius: 12, background: row.status === 'Active' ? '#dcfce7' : '#fef9c3' }}>
          {row.status}
        </span>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      priority: 3,
      minWidth: 130,
      accessor: 'role',
    },
    {
      id: 'salary',
      header: 'Compensation',
      priority: 4,
      minWidth: 110,
      render: (salary) => `$${salary.toLocaleString()} / yr`,
    },
    {
      id: 'joinDate',
      header: 'Joined Date',
      priority: 9, // Lower priority: Collapses first on small screens
      minWidth: 100,
      accessor: 'joinDate',
    },
    {
      id: 'actions',
      header: 'Actions',
      priority: 1,
      alwaysVisible: true,
      render: (_, row) => (
        <button onClick={() => alert(`Viewing ${row.name}`)}>
          View
        </button>
      ),
    },
  ];

  return (
    <ResponsiveTable
      data={data}
      columns={columns}
      title="Team Members"
      pageSize={10}
      striped
      hoverable
      expandOnRowClick
    />
  );
}
```

---

## 🎛️ Controlled Mode & Server-Side Data Fetching

Sync table state with URL search parameters or connect to a backend API:

```tsx
import { useState, useEffect } from 'react';
import { ResponsiveTable, type SortState } from 'react-responsive-datatable';

export function ControlledServerTable() {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState | null>({ columnId: 'name', direction: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch from server whenever state changes
  useEffect(() => {
    fetchUsers({ search, sort, page, pageSize }).then((res) => {
      setData(res.items);
      setTotalCount(res.total);
    });
  }, [search, sort, page, pageSize]);

  return (
    <ResponsiveTable
      data={data}
      columns={columns}
      totalItems={totalCount}
      manualPagination={true}
      manualSorting={true}
      manualFiltering={true}
      searchQuery={search}
      onSearchChange={setSearch}
      sortState={sort}
      onSortChange={setSort}
      currentPage={page}
      onPageChange={setPage}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
    />
  );
}
```

---

## 🎨 Universal Dynamic Styling (Works in Any Project)

The table is completely style-agnostic. It inherits typography, borders, and colors directly from your project without lock-in to any specific framework:

### 1. Automatic Design Token Inheritance
By default, the table's CSS variables inherit your app's global tokens (compatible with Tailwind, shadcn, CSS Variables):
- `--rdt-primary`: Defaults to `var(--primary, #0284c7)`
- `--rdt-bg`: Defaults to `var(--background, #ffffff)`
- `--rdt-text`: Defaults to `var(--foreground, #1e293b)`
- `--rdt-border`: Defaults to `var(--border, #e2e8f0)`
- `font-family`: Automatically inherits parent font

### 2. Granular Class Slots (`classNames`)
Inject utility classes or custom CSS into any component slot:
```tsx
<ResponsiveTable
  data={data}
  columns={columns}
  classNames={{
    table: 'w-full divide-y divide-zinc-200 dark:divide-zinc-800',
    th: 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 font-semibold py-3 px-4',
    td: 'py-3 px-4 text-sm text-zinc-800 dark:text-zinc-200',
    searchInput: 'rounded-xl border-zinc-300 focus:ring-2 focus:ring-blue-500',
    pageButtonActive: 'bg-blue-600 text-white shadow-sm',
  }}
/>
```

### 3. Headless Unstyled Mode
To build your own custom design system without any default styles:
```tsx
<ResponsiveTable
  data={data}
  columns={columns}
  unstyled={true}
  classNames={{
    table: 'w-full text-left',
    th: 'border-b p-3 font-medium',
    td: 'border-b p-3',
  }}
/>
```

---

## ⚡ Using in Next.js (App Router)

Because responsive column measurements use `ResizeObserver` and DOM geometry, simply add `"use client"` at the top of your component or page:

```tsx
// app/users/page.tsx
'use client';

import { ResponsiveTable, type ResponsiveColumn } from 'react-responsive-datatable';
import 'react-responsive-datatable/styles.css';

export default function UsersPage() {
  return (
    <main style={{ padding: 24 }}>
      <ResponsiveTable data={users} columns={columns} />
    </main>
  );
}
```

---

## 🎛️ Column Configuration (`ResponsiveColumn<T, V>`)

> **Note on Priority Convention**: Matches DataTables standard convention where `1` = highest importance (stays visible longest), and higher numbers (`5, 9`) collapse earlier when space is constrained.

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Required** | Unique column identifier. |
| `header` | `React.ReactNode` | **Required** | Column header label or custom JSX element. |
| `accessor` | `keyof T \| ((row: T) => V)` | `id` | Key or extractor function for row value. |
| `priority` | `number` | `10` | **Responsive Priority**: `1` stays visible longest; higher numbers (`5, 9`) collapse first when container shrinks. |
| `minWidth` | `number` | `110` | Minimum width in pixels required by this column. |
| `alwaysVisible`| `boolean` | `false` | If `true`, this column will never be collapsed into the child details row. |
| `sortable` | `boolean` | `true` | Enables/disables column sorting (ASC/DESC). |
| `searchable` | `boolean` | `true` | Includes/excludes this column from global search. |
| `className` | `string` | `undefined` | Custom CSS class name for `<th>` and `<td>`. |
| `render` | `(val, row, index, isCollapsed) => ReactNode` | `undefined` | Custom React component cell renderer. |
| `renderDetail`| `(val, row, index) => ReactNode` | `undefined` | Optional specialized renderer for the collapsed child row view. |

---

## ⚙️ Table Configuration (`ResponsiveTableProps<T>`)

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `data` | `T[]` | **Required** | Array of row objects. |
| `columns` | `ResponsiveColumn<T>[]`| **Required** | Array of column definitions. |
| `title` | `ReactNode` | `undefined` | Table header title. |
| `tableAriaLabel` | `string` | `undefined` | Accessible ARIA label for screen readers. |
| `searchable` | `boolean` | `true` | Show/hide the global search filter. |
| `searchDebounceMs` | `number` | `0` | Debounce (ms) before a typed query is committed to filtering / `onSearchChange`. The input itself always updates instantly. |
| `searchQuery` | `string` | `undefined` | Controlled search input query. |
| `onSearchChange` | `(q: string) => void` | `undefined` | Callback fired on search query input. |
| `pagination` | `boolean` | `true` | Show/hide pagination controls and page size selector. |
| `pageSize` | `number` | `10` | Records per page (controlled or default). |
| `pageSizeOptions` | `number[]` | `[5, 10, 25, 50, 100]` | Page size dropdown options. |
| `onPageSizeChange` | `(size: number) => void` | `undefined` | Callback fired on page size selection. |
| `currentPage` | `number` | `1` | Controlled active page number. |
| `onPageChange` | `(page: number) => void` | `undefined` | Callback fired on page navigation. |
| `totalItems` | `number` | `undefined` | Total items count for server-side pagination. |
| `manualPagination`| `boolean` | `false` | Disables client-side data slicing for server-side APIs. |
| `manualSorting` | `boolean` | `false` | Disables client-side data sorting for server-side APIs. |
| `manualFiltering`| `boolean` | `false` | Disables client-side data filtering for server-side APIs. |
| `sortable` | `boolean` | `true` | Enables sorting globally. |
| `sortState` | `SortState \| null` | `undefined` | Controlled sorting state. |
| `onSortChange` | `(sort) => void` | `undefined` | Callback fired on sort column/direction change. |
| `expandedRowIds` | `Set<string \| number>` | `undefined` | Controlled expanded row IDs. |
| `onRowExpandChange`| `(ids) => void` | `undefined` | Callback fired when child rows expand/collapse. |
| `resizableColumns` | `boolean` | `false` | Adds drag-to-resize handles to column headers. |
| `exportFileName` | `string` | `'datatable_export.csv'` | Filename used by the CSV export button. |
| `unstyled` | `boolean` | `false` | Strips all default styling for 100% custom styling control. |
| `classNames` | `TableClassNames` | `{}` | Granular slot classes for each element. |
| `icons` | `TableIcons` | `undefined` | Custom icon components to override default SVGs. |
| `striped` | `boolean` | `true` | Alternating row backgrounds. |
| `hoverable` | `boolean` | `true` | Row hover highlight effect. |
| `bordered` | `boolean` | `false` | Cell borders. |
| `expandOnRowClick`| `boolean` | `false` | Click anywhere on row to toggle collapsed child details. |

---

## 🧪 Testing

The library includes a complete test suite with **100% pass rate**:

```bash
npm test
```

Includes unit tests for `useResponsiveColumns` (priority ordering, `alwaysVisible`, tie-breakers, edge cases) and integration tests for `<ResponsiveTable>` (rendering, search, sort, pagination, controlled mode, a11y).

---

## 📦 Publishing to NPM

```bash
# 1. Run test suite
npm test

# 2. Build the distribution bundle
npm run build:lib

# 3. Publish to NPM
npm publish --access public
```

---

## 📄 License
MIT © UDAN
