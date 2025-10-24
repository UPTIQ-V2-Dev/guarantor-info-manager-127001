import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/test-utils';
import { GuarantorListPage } from '../GuarantorListPage';
import { mockPaginatedResponse } from '@/test/mocks/mockData';

// Mock the hooks
vi.mock('@/hooks/useGuarantor', () => ({
    useGuarantors: vi.fn(),
    useExportGuarantors: vi.fn(() => ({
        mutateAsync: vi.fn()
    }))
}));

vi.mock('@/hooks/useDebounce', () => ({
    useDebounce: vi.fn(value => value)
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>
    };
});

// Mock sonner
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

describe('GuarantorListPage', () => {
    const user = userEvent.setup();

    const mockUseGuarantors = vi.fn();
    const mockUseExportGuarantors = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset mocks
        const { useGuarantors, useExportGuarantors } = require('@/hooks/useGuarantor');
        useGuarantors.mockImplementation(mockUseGuarantors);
        useExportGuarantors.mockImplementation(mockUseExportGuarantors);

        // Default mock implementations
        mockUseGuarantors.mockReturnValue({
            data: mockPaginatedResponse,
            isLoading: false,
            error: null,
            refetch: vi.fn()
        });

        mockUseExportGuarantors.mockReturnValue({
            mutateAsync: vi.fn()
        });
    });

    it('should render page header and navigation elements', () => {
        render(<GuarantorListPage />);

        expect(screen.getByText('Guarantor Submissions')).toBeInTheDocument();
        expect(screen.getByText('Manage and track guarantor background information')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /new guarantor/i })).toBeInTheDocument();
    });

    it('should render search and filter controls', () => {
        render(<GuarantorListPage />);

        expect(screen.getByPlaceholderText(/search by name, occupation, or employer/i)).toBeInTheDocument();
        expect(screen.getByText('Filter by status')).toBeInTheDocument();
    });

    it('should display guarantor data in table', async () => {
        render(<GuarantorListPage />);

        await waitFor(() => {
            // Check for table headers
            expect(screen.getByText('Name & Relationship')).toBeInTheDocument();
            expect(screen.getByText('Professional Info')).toBeInTheDocument();
            expect(screen.getByText('Location')).toBeInTheDocument();
            expect(screen.getByText('Status')).toBeInTheDocument();
            expect(screen.getByText('Submitted')).toBeInTheDocument();

            // Check for guarantor data from mock
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
        });
    });

    it('should show loading skeletons when data is loading', () => {
        mockUseGuarantors.mockReturnValue({
            data: null,
            isLoading: true,
            error: null,
            refetch: vi.fn()
        });

        render(<GuarantorListPage />);

        // Should show skeleton loading rows
        expect(screen.getAllByRole('row')).toHaveLength(6); // 1 header + 5 skeleton rows
    });

    it('should show error state when data fetch fails', () => {
        mockUseGuarantors.mockReturnValue({
            data: null,
            isLoading: false,
            error: new Error('Failed to fetch'),
            refetch: vi.fn()
        });

        render(<GuarantorListPage />);

        expect(screen.getByText('Failed to load guarantors. Please try again.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should show empty state when no guarantors exist', () => {
        mockUseGuarantors.mockReturnValue({
            data: { ...mockPaginatedResponse, results: [], totalResults: 0 },
            isLoading: false,
            error: null,
            refetch: vi.fn()
        });

        render(<GuarantorListPage />);

        expect(screen.getByText('No guarantors found')).toBeInTheDocument();
        expect(screen.getByText('Get started by adding a new guarantor')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add new guarantor/i })).toBeInTheDocument();
    });

    it('should handle search input', async () => {
        render(<GuarantorListPage />);

        const searchInput = screen.getByPlaceholderText(/search by name, occupation, or employer/i);
        await user.type(searchInput, 'John');

        expect(searchInput).toHaveValue('John');
    });

    it('should handle status filter changes', async () => {
        render(<GuarantorListPage />);

        const statusFilter = screen.getByRole('combobox');
        await user.click(statusFilter);

        // Should show status options
        await waitFor(() => {
            expect(screen.getByText('Pending Verification')).toBeInTheDocument();
            expect(screen.getByText('In Review')).toBeInTheDocument();
            expect(screen.getByText('Verified')).toBeInTheDocument();
            expect(screen.getByText('Rejected')).toBeInTheDocument();
        });
    });

    it('should show results count when filters are applied', async () => {
        render(<GuarantorListPage />);

        const searchInput = screen.getByPlaceholderText(/search by name, occupation, or employer/i);
        await user.type(searchInput, 'test');

        await waitFor(() => {
            expect(screen.getByText(/3 results found/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
        });
    });

    it('should display status badges with correct styling', () => {
        render(<GuarantorListPage />);

        // Check that status badges are rendered (they should be in the mock data)
        expect(screen.getByText('Pending Verification')).toBeInTheDocument();
        expect(screen.getByText('Verified')).toBeInTheDocument();
        expect(screen.getByText('In Review')).toBeInTheDocument();
    });

    it('should render action dropdown for each guarantor row', async () => {
        render(<GuarantorListPage />);

        await waitFor(() => {
            const actionButtons = screen.getAllByRole('button');
            const dropdownButtons = actionButtons.filter(
                button => button.querySelector('svg') && !button.textContent?.trim()
            );
            expect(dropdownButtons.length).toBeGreaterThan(0);
        });
    });

    it('should show formatted dates correctly', () => {
        render(<GuarantorListPage />);

        // Dates should be formatted nicely (mock data has specific dates)
        expect(screen.getByText(/oct/i)).toBeInTheDocument();
    });

    it('should handle export functionality', async () => {
        const mockMutateAsync = vi.fn();
        mockUseExportGuarantors.mockReturnValue({
            mutateAsync: mockMutateAsync
        });

        render(<GuarantorListPage />);

        const exportButton = screen.getByRole('button', { name: /export/i });
        await user.click(exportButton);

        // Should show export options
        await waitFor(() => {
            expect(screen.getByText('Export as CSV')).toBeInTheDocument();
            expect(screen.getByText('Export as Excel')).toBeInTheDocument();
            expect(screen.getByText('Export as JSON')).toBeInTheDocument();
        });
    });

    it('should show pagination when multiple pages exist', () => {
        const multiPageResponse = {
            ...mockPaginatedResponse,
            totalPages: 3,
            page: 1
        };

        mockUseGuarantors.mockReturnValue({
            data: multiPageResponse,
            isLoading: false,
            error: null,
            refetch: vi.fn()
        });

        render(<GuarantorListPage />);

        expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('should not show pagination when only one page exists', () => {
        render(<GuarantorListPage />);

        expect(screen.queryByText(/page 1 of 1/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
    });
});
