import { useState } from 'react';
import { ResponsiveTable } from './lib/ResponsiveTable';
import type { ResponsiveColumn } from './lib/types';
import { SAMPLE_EMPLOYEES } from './demo/mockData';
import type { Employee } from './demo/mockData';
import { ResizerBench } from './demo/ResizerBench';
import {
  IconStar,
  IconTrash,
  IconEdit,
  IconCheckCircle,
  IconAlertCircle,
  IconClock,
  IconBan,
  IconLayers,
  IconPackage,
  IconSparkles,
} from './demo/demoIcons';

export function App() {
  const [employees, setEmployees] = useState<Employee[]>(SAMPLE_EMPLOYEES);
  const [benchWidth, setBenchWidth] = useState<number | string>('100%');
  const [activeTab, setActiveTab] = useState<'demo' | 'dynamic' | 'reverse' | 'npm'>('demo');

  // Handle sample interactive action: Delete
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete record for ${name}?`)) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // Handle sample interactive action: Toggle Status
  const handleToggleStatus = (id: string) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const nextStatus: Employee['status'] =
            e.status === 'Active'
              ? 'Review'
              : e.status === 'Review'
              ? 'Suspended'
              : 'Active';
          return { ...e, status: nextStatus };
        }
        return e;
      })
    );
  };

  // Column definitions with DataTables priority mapping
  const columns: ResponsiveColumn<Employee>[] = [
    {
      id: 'name',
      header: 'Employee Profile',
      priority: 1, // Highest priority: Never collapses
      alwaysVisible: true, // Primary column: Always pinned so mobile shows who this row belongs to!
      minWidth: 175,
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <img
            src={row.avatar}
            alt={row.name}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
              border: '1.5px solid var(--rdt-border)',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
            <span
              style={{
                fontWeight: 600,
                color: 'var(--rdt-text)',
                fontSize: 13,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {row.name}
            </span>
            <span
              style={{
                fontSize: 11,
                color: 'var(--rdt-text-muted)',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      priority: 2, // Second priority
      minWidth: 105,
      render: (_, row) => {
        const config = {
          Active: { bg: '#dcfce7', text: '#15803d', icon: IconCheckCircle },
          Review: { bg: '#fef9c3', text: '#a16207', icon: IconClock },
          Suspended: { bg: '#fee2e2', text: '#b91c1c', icon: IconBan },
          Inactive: { bg: '#f1f5f9', text: '#64748b', icon: IconAlertCircle },
        }[row.status];
        const Icon = config.icon;

        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(row.id);
            }}
            title="Click to change status"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: config.bg,
              color: config.text,
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.1s',
            }}
          >
            <Icon size={13} />
            <span>{row.status}</span>
          </button>
        );
      },
    },
    {
      id: 'role',
      header: 'Role',
      priority: 3,
      minWidth: 165,
      accessor: 'role',
      render: (role) => (
        <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{role}</span>
      ),
    },
    {
      id: 'progress',
      header: 'Completion',
      priority: 4,
      minWidth: 115,
      accessor: 'progress',
      render: (progress) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 100 }}>
          <div
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#e2e8f0',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor:
                  progress > 80 ? '#10b981' : progress > 50 ? '#0284c7' : '#f59e0b',
                borderRadius: 3,
              }}
            />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, minWidth: 30 }}>
            {progress}%
          </span>
        </div>
      ),
    },
    {
      id: 'department',
      header: 'Department',
      priority: 5,
      minWidth: 115,
      accessor: 'department',
    },
    {
      id: 'salary',
      header: 'Compensation',
      priority: 6,
      minWidth: 110,
      accessor: 'salary',
      render: (salary) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
          ${salary.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'rating',
      header: 'Rating',
      priority: 7,
      minWidth: 95,
      accessor: 'rating',
      render: (rating) => (
        <div style={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: 5 }, (_, i) => (
            <IconStar
              key={i}
              size={12}
              fill={i < rating ? '#eab308' : '#e2e8f0'}
              color={i < rating ? '#ca8a04' : '#cbd5e1'}
            />
          ))}
        </div>
      ),
    },
    {
      id: 'location',
      header: 'Location',
      priority: 8,
      minWidth: 125,
      accessor: 'location',
    },
    {
      id: 'joinDate',
      header: 'Joined Date',
      priority: 9, // Lowest priority: Collapses first when screen shrinks!
      minWidth: 105,
      accessor: 'joinDate',
    },
    {
      id: 'actions',
      header: 'Actions',
      priority: 1, // Keep visible
      alwaysVisible: true,
      sortable: false,
      searchable: false,
      minWidth: 100,
      className: 'rdt-actions-col',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
          <button
            type="button"
            title="Edit"
            onClick={(e) => {
              e.stopPropagation();
              alert(`Edit record: ${row.name}`);
            }}
            style={{
              padding: '4px 6px',
              border: '1px solid var(--rdt-border)',
              borderRadius: 4,
              background: 'var(--rdt-bg)',
              cursor: 'pointer',
              color: 'var(--rdt-text)',
            }}
          >
            <IconEdit size={12} />
          </button>
          <button
            type="button"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id, row.name);
            }}
            style={{
              padding: '4px 6px',
              border: '1px solid #fecaca',
              borderRadius: 4,
              background: '#fff1f2',
              cursor: 'pointer',
              color: '#e11d48',
            }}
          >
            <IconTrash size={12} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '24px 20px 60px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        {/* Header */}
        <header
          style={{
            marginBottom: 24,
            textAlign: 'left',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: 20,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#0284c7',
                  color: '#ffffff',
                  padding: '6px 10px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                RDT
              </span>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  margin: 0,
                  color: '#0f172a',
                  letterSpacing: '-0.5px',
                }}
              >
                React Responsive DataTable
              </h1>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 12,
                  background: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0',
                }}
              >
                React 19 & Next.js Ready
              </span>
            </div>
            <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 14 }}>
              Reverse-engineered DataTables Responsive CSS & Priority Engine natively built for React components.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 20,
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
              }}
            >
              Universal Style Agnostic
            </span>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 20,
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: 2,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('demo')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: '6px 6px 0 0',
              border: 'none',
              background: activeTab === 'demo' ? '#ffffff' : 'transparent',
              color: activeTab === 'demo' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'demo' ? '2px solid #0284c7' : 'none',
              cursor: 'pointer',
            }}
          >
            <IconLayers size={16} />
            <span>Interactive Table Demo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dynamic')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: '6px 6px 0 0',
              border: 'none',
              background: activeTab === 'dynamic' ? '#ffffff' : 'transparent',
              color: activeTab === 'dynamic' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'dynamic' ? '2px solid #0284c7' : 'none',
              cursor: 'pointer',
            }}
          >
            <IconSparkles size={16} />
            <span>Dynamic Styling in Any Project</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reverse')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: '6px 6px 0 0',
              border: 'none',
              background: activeTab === 'reverse' ? '#ffffff' : 'transparent',
              color: activeTab === 'reverse' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'reverse' ? '2px solid #0284c7' : 'none',
              cursor: 'pointer',
            }}
          >
            <IconLayers size={16} />
            <span>Reverse Engineering Architecture</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('npm')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: '6px 6px 0 0',
              border: 'none',
              background: activeTab === 'npm' ? '#ffffff' : 'transparent',
              color: activeTab === 'npm' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'npm' ? '2px solid #0284c7' : 'none',
              cursor: 'pointer',
            }}
          >
            <IconPackage size={16} />
            <span>NPM Package & Next.js Guide</span>
          </button>
        </div>

        {/* Tab 1: Interactive Table Demo */}
        {activeTab === 'demo' && (
          <div>
            {/* Resizer Test Bench */}
            <ResizerBench width={benchWidth} onWidthChange={setBenchWidth}>
              <div
                style={{
                  background: '#ffffff',
                  padding: typeof benchWidth === 'number' && benchWidth < 500 ? '12px 10px' : 20,
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  boxSizing: 'border-box',
                }}
              >
                <ResponsiveTable<Employee>
                  data={employees}
                  columns={columns}
                  title="Team Directory"
                  searchPlaceholder="Search employees, roles, departments..."
                  pageSize={5}
                  pageSizeOptions={[5, 10, 25]}
                  striped
                  hoverable
                  expandOnRowClick
                />
              </div>
            </ResizerBench>

            {/* Quick Priority Guide */}
            <div
              style={{
                marginTop: 24,
                padding: 16,
                background: '#ffffff',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                textAlign: 'left',
              }}
            >
              <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700 }}>
                💡 How the Responsive Column Priority works:
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                Try shrinking the container width with the slider above. Columns with higher priority numbers (e.g.{' '}
                <strong>Joined Date (Priority 9)</strong>, <strong>Location (Priority 8)</strong>,{' '}
                <strong>Rating (Priority 7)</strong>) automatically collapse into the expandable child row first.{' '}
                Clicking the blue <strong style={{ color: '#0284c7' }}>+</strong> icon shows all collapsed columns
                rendered with their <strong>full interactive React components</strong> (ratings, progress bars, buttons, and badges),
                retaining React state without DOM tearing!
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Dynamic Universal Styling in Any Project */}
        {activeTab === 'dynamic' && (
          <div
            style={{
              background: '#ffffff',
              padding: 28,
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              lineHeight: 1.7,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                Zero-Lockin
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Universal Dynamic Styling (Sets Perfectly in Any Project)
              </h2>
            </div>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 20 }}>
              The component is designed to be <strong>completely framework-agnostic</strong>. Whether your project uses Tailwind CSS, HeroUI, shadcn/ui, CSS Modules, or Vanilla CSS, it adapts dynamically with zero hardcoded theme lock-in.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16,
                marginBottom: 24,
              }}
            >
              <div style={{ padding: 16, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 6px', color: '#0284c7', fontSize: 15 }}>1. Natural Design Token Inheritance</h4>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                  Uses CSS variables mapped to standard tokens (<code>--primary</code>, <code>--border</code>, <code>--background</code>, <code>--foreground</code>). It automatically inherits your app's font and color scheme!
                </p>
              </div>

              <div style={{ padding: 16, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 6px', color: '#0284c7', fontSize: 15 }}>2. Granular Slot ClassNames</h4>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                  Pass utility classes or custom CSS to any slot via <code>classNames</code> (<code>table</code>, <code>th</code>, <code>td</code>, <code>searchInput</code>, <code>childRow</code>, etc.).
                </p>
              </div>

              <div style={{ padding: 16, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 6px', color: '#0284c7', fontSize: 15 }}>3. Headless Unstyled Mode</h4>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                  Enable <code>unstyled=&#123;true&#125;</code> to strip all base CSS, allowing full customized styling with zero CSS specificity conflicts.
                </p>
              </div>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '20px 0 8px' }}>
              Example: Dynamic Styling in Any React or Next.js App
            </h3>
            <pre
              style={{
                background: '#0f172a',
                color: '#f8fafc',
                padding: 18,
                borderRadius: 8,
                fontSize: 13,
                overflowX: 'auto',
              }}
            >
{`import { ResponsiveTable, type ResponsiveColumn } from 'react-responsive-datatable';
import 'react-responsive-datatable/styles.css';

// 1. Column definitions with your custom components and styling
const columns: ResponsiveColumn<User>[] = [
  {
    id: 'name',
    header: 'Name',
    priority: 1,
    alwaysVisible: true,
    render: (_, row) => <span className="font-semibold">{row.name}</span>,
  },
  {
    id: 'status',
    header: 'Status',
    priority: 2,
    render: (_, row) => (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
        {row.status}
      </span>
    ),
  },
  {
    id: 'salary',
    header: 'Salary',
    priority: 3,
    accessor: 'salary',
    render: (val) => \`\$\${val.toLocaleString()}\`,
  },
];

// 2. Render with any classes - applies dynamically!
export function MyTable() {
  return (
    <ResponsiveTable
      data={data}
      columns={columns}
      className="my-custom-table-container"
      classNames={{
        table: 'w-full divide-y divide-zinc-200 dark:divide-zinc-800',
        th: 'py-3 text-xs uppercase font-semibold text-zinc-500',
        td: 'py-3 text-sm text-zinc-900 dark:text-zinc-100',
        searchInput: 'rounded-lg border-zinc-300 focus:border-blue-500',
      }}
    />
  );
}`}
            </pre>
          </div>
        )}

        {/* Tab 3: Reverse Engineering Insights */}
        {activeTab === 'reverse' && (
          <div
            style={{
              background: '#ffffff',
              padding: 28,
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              lineHeight: 1.7,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>
              Reverse-Engineering DataTables Responsive for Modern React
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 20,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  padding: 18,
                  borderRadius: 8,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                }}
              >
                <h4 style={{ margin: '0 0 8px', color: '#991b1b', fontSize: 15 }}>
                  ⚠️ jQuery DataTables Responsive (Original)
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#7f1d1d' }}>
                  <li>Directly mutates DOM elements outside React lifecycle.</li>
                  <li>Clones HTML strings into child rows, destroying React event listeners and hooks.</li>
                  <li>Heavy jQuery dependency (~80KB+ overhead).</li>
                  <li>Causes hydration errors and breaks React Server Components in Next.js.</li>
                  <li>Difficult to embed complex React dropdowns, tooltips, or modals inside collapsed cells.</li>
                </ul>
              </div>

              <div
                style={{
                  padding: 18,
                  borderRadius: 8,
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                }}
              >
                <h4 style={{ margin: '0 0 8px', color: '#166534', fontSize: 15 }}>
                  ✅ Our Native React Implementation (Re-engineered)
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#14532d' }}>
                  <li>Zero jQuery: 100% pure React 19 / TypeScript / Virtual DOM.</li>
                  <li>
                    <strong>`ResizeObserver` priority algorithm</strong>: dynamic container-aware column collapsing.
                  </li>
                  <li>Custom React component renderers work seamlessly in both main table and collapsed child rows.</li>
                  <li>Full keyboard navigation, sorting, multi-field search, pagination, and CSV export.</li>
                  <li>SSR safe, Next.js App Router compatible (`"use client"`), and tree-shakeable.</li>
                </ul>
              </div>
            </div>

            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '20px 0 10px' }}>
              The Responsive Hiding Algorithm
            </h3>
            <p style={{ fontSize: 14, color: '#475569' }}>
              In DataTables, columns are collapsed based on a priority queue. Our <code>useResponsiveColumns</code> hook replicates this:
            </p>
            <pre
              style={{
                background: '#0f172a',
                color: '#f8fafc',
                padding: 16,
                borderRadius: 8,
                fontSize: 13,
                overflowX: 'auto',
              }}
            >
{`// 1. Measure Container Width via ResizeObserver
const containerWidth = containerRef.current.clientWidth;

// 2. Sort columns by collapse order:
//    - alwaysVisible columns are kept till the end
//    - Highest priority number collapses first (e.g. priority 9 collapses before priority 1)
//    - Rightmost column collapses first when priorities are equal
const sortedToCollapse = columns.sort((a, b) => {
  if (a.alwaysVisible !== b.alwaysVisible) return a.alwaysVisible ? 1 : -1;
  if (b.priority !== a.priority) return b.priority - a.priority;
  return b.index - a.index;
});

// 3. Mark columns as collapsed until remaining columns fit inside containerWidth`}
            </pre>
          </div>
        )}

        {/* Tab 3: NPM Package & Next.js Guide */}
        {activeTab === 'npm' && (
          <div
            style={{
              background: '#ffffff',
              padding: 28,
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              lineHeight: 1.7,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>
              Packaging for NPM & Next.js Usage
            </h2>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '20px 0 8px' }}>
              1. Usage in Next.js (App Router)
            </h3>
            <p style={{ fontSize: 14, color: '#475569' }}>
              Because responsive table measurements require <code>ResizeObserver</code> and window events, wrap it in a client component:
            </p>
            <pre
              style={{
                background: '#0f172a',
                color: '#f8fafc',
                padding: 16,
                borderRadius: 8,
                fontSize: 13,
                overflowX: 'auto',
              }}
            >
{`// app/users/page.tsx
'use client';

import { ResponsiveTable, type ResponsiveColumn } from 'react-responsive-datatable';
import 'react-responsive-datatable/styles.css';

interface User {
  id: string;
  name: string;
  role: string;
  status: string;
}

const columns: ResponsiveColumn<User>[] = [
  { id: 'name', header: 'Name', priority: 1, minWidth: 200 },
  { id: 'role', header: 'Role', priority: 2, minWidth: 150 },
  {
    id: 'status',
    header: 'Status',
    priority: 3,
    render: (val, row) => <span className="badge">{row.status}</span>
  },
];

export default function UsersPage() {
  return <ResponsiveTable data={users} columns={columns} />;
}`}
            </pre>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '24px 0 8px' }}>
              2. How to build and publish as an NPM Package
            </h3>
            <p style={{ fontSize: 14, color: '#475569' }}>
              To export this library as an npm package (e.g. <code>react-responsive-datatable</code>), run:
            </p>
            <pre
              style={{
                background: '#0f172a',
                color: '#f8fafc',
                padding: 16,
                borderRadius: 8,
                fontSize: 13,
                overflowX: 'auto',
              }}
            >
{`# 1. Build TypeScript and library bundles (ESM + CJS + Types)
npm run build:lib

# 2. Login to npm
npm login

# 3. Publish to npm
npm publish --access public`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
