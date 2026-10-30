import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ResponsiveTable } from '../lib/ResponsiveTable';
import type { ResponsiveColumn } from '../lib/types';

interface TestUser {
  id: string;
  name: string;
  role: string;
  age: number;
}

const mockUsers: TestUser[] = [
  { id: '1', name: 'Alice Smith', role: 'Engineer', age: 28 },
  { id: '2', name: 'Bob Jones', role: 'Designer', age: 34 },
  { id: '3', name: 'Charlie Brown', role: 'Manager', age: 42 },
  { id: '4', name: 'Diana Prince', role: 'Architect', age: 31 },
  { id: '5', name: 'Ethan Hunt', role: 'Security', age: 37 },
  { id: '6', name: 'Fiona Gallagher', role: 'Analyst', age: 26 },
];

const mockColumns: ResponsiveColumn<TestUser>[] = [
  { id: 'name', header: 'Name', priority: 1, minWidth: 150 },
  { id: 'role', header: 'Role', priority: 2, minWidth: 120 },
  { id: 'age', header: 'Age', priority: 3, minWidth: 80 },
];

describe('ResponsiveTable Component', () => {
  it('renders table headers and data rows correctly', () => {
    render(<ResponsiveTable data={mockUsers} columns={mockColumns} title="Test Users" />);

    expect(screen.getByText('Test Users')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('filters rows based on search input', () => {
    render(<ResponsiveTable data={mockUsers} columns={mockColumns} />);

    const searchInput = screen.getByPlaceholderText('Search records...');
    fireEvent.change(searchInput, { target: { value: 'Designer' } });

    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
  });

  it('sorts columns ascending and descending on header click', () => {
    render(<ResponsiveTable data={mockUsers} columns={mockColumns} pageSize={10} />);

    const nameHeader = screen.getByText('Name');

    // First click: Sort ASC (Alice first, Fiona last)
    fireEvent.click(nameHeader);
    let cells = screen.getAllByRole('cell');
    expect(cells[0]).toHaveTextContent('Alice Smith');

    // Second click: Sort DESC (Fiona first, Alice last)
    fireEvent.click(nameHeader);
    cells = screen.getAllByRole('cell');
    expect(cells[0]).toHaveTextContent('Fiona Gallagher');
  });

  it('paginates data and changes page correctly', () => {
    render(<ResponsiveTable data={mockUsers} columns={mockColumns} pageSize={2} />);

    expect(screen.getByText(/Showing 1 to 2 of 6 entries/i)).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();

    // Click next page button
    const page2Button = screen.getByRole('button', { name: 'Page 2' });
    fireEvent.click(page2Button);

    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    expect(screen.getByText('Diana Prince')).toBeInTheDocument();
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
  });

  it('supports controlled mode with onSearchChange and onSortChange', () => {
    const handleSearch = vi.fn();
    const handleSort = vi.fn();

    render(
      <ResponsiveTable
        data={mockUsers}
        columns={mockColumns}
        searchQuery="Alice"
        onSearchChange={handleSearch}
        onSortChange={handleSort}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search records...');
    fireEvent.change(searchInput, { target: { value: 'Bob' } });
    expect(handleSearch).toHaveBeenCalledWith('Bob');

    const roleHeader = screen.getByText('Role');
    fireEvent.click(roleHeader);
    expect(handleSort).toHaveBeenCalledWith({ columnId: 'role', direction: 'asc' });
  });

  it('renders interactive React components inside custom cell renderers', () => {
    const handleButtonClick = vi.fn();

    const interactiveColumns: ResponsiveColumn<TestUser>[] = [
      { id: 'name', header: 'Name' },
      {
        id: 'actions',
        header: 'Actions',
        render: (_, row) => (
          <button type="button" onClick={() => handleButtonClick(row.name)}>
            Edit {row.name}
          </button>
        ),
      },
    ];

    render(<ResponsiveTable data={mockUsers.slice(0, 2)} columns={interactiveColumns} />);

    const editButton = screen.getByRole('button', { name: 'Edit Alice Smith' });
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);
    expect(handleButtonClick).toHaveBeenCalledWith('Alice Smith');
  });

  it('displays empty state message when no records match filter', () => {
    render(<ResponsiveTable data={mockUsers} columns={mockColumns} />);

    const searchInput = screen.getByPlaceholderText('Search records...');
    fireEvent.change(searchInput, { target: { value: 'NonexistentUser123' } });

    expect(screen.getByText('No matching records found')).toBeInTheDocument();
  });

  it('provides proper ARIA attributes for accessibility', () => {
    render(<ResponsiveTable data={mockUsers} columns={mockColumns} title="Accessible Table" />);

    const region = screen.getByRole('region', { name: 'Accessible Table' });
    expect(region).toBeInTheDocument();

    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toHaveAttribute('aria-sort', 'none');

    fireEvent.click(nameHeader!);
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  it('gives each table instance a unique page-size select id', () => {
    const { container } = render(
      <>
        <ResponsiveTable data={mockUsers} columns={mockColumns} />
        <ResponsiveTable data={mockUsers} columns={mockColumns} />
      </>
    );
    const selects = container.querySelectorAll('select');
    expect(selects).toHaveLength(2);
    expect(selects[0].id).not.toBe(selects[1].id);
  });

  it('debounces search commit when searchDebounceMs is set', () => {
    vi.useFakeTimers();
    try {
      render(<ResponsiveTable data={mockUsers} columns={mockColumns} searchDebounceMs={200} />);
      const searchInput = screen.getByPlaceholderText('Search records...');
      fireEvent.change(searchInput, { target: { value: 'Designer' } });

      // Not filtered yet — commit is debounced
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('updates visible rows dynamically when page size changes', () => {
    render(
      <ResponsiveTable
        data={mockUsers}
        columns={mockColumns}
        pageSize={2}
        pageSizeOptions={[2, 4, 6]}
      />
    );

    expect(screen.getByText(/Showing 1 to 2 of 6 entries/i)).toBeInTheDocument();

    const pageSizeSelect = screen.getByLabelText('Select page size');
    fireEvent.change(pageSizeSelect, { target: { value: '6' } });

    expect(screen.getByText(/Showing 1 to 6 of 6 entries/i)).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Fiona Gallagher')).toBeInTheDocument();
  });
});
