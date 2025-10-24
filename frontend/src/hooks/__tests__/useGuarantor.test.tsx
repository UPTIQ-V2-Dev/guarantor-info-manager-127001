import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    useGuarantor,
    useGuarantors,
    useCreateGuarantor,
    useUpdateGuarantor,
    useDeleteGuarantor,
    useDashboardStats
} from '../useGuarantor';
import { mockGuarantor, mockPaginatedResponse, mockDashboardStats, mockFormData } from '@/test/mocks/mockData';
import * as guarantorApi from '@/services/guarantorApi';

// Mock the API services
vi.mock('@/services/guarantorApi', () => ({
    createGuarantor: vi.fn(),
    updateGuarantor: vi.fn(),
    getGuarantor: vi.fn(),
    getGuarantors: vi.fn(),
    deleteGuarantor: vi.fn(),
    getDashboardStats: vi.fn(),
    sendForVerification: vi.fn()
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, staleTime: 0, gcTime: 0 },
            mutations: { retry: false }
        }
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useGuarantor hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('useGuarantor', () => {
        it('should fetch single guarantor successfully', async () => {
            vi.mocked(guarantorApi.getGuarantor).mockResolvedValue(mockGuarantor);

            const { result } = renderHook(() => useGuarantor('1'), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockGuarantor);
            expect(guarantorApi.getGuarantor).toHaveBeenCalledWith('1');
        });

        it('should not fetch when id is empty', () => {
            const { result } = renderHook(() => useGuarantor(''), {
                wrapper: createWrapper()
            });

            expect(result.current.data).toBeUndefined();
            expect(guarantorApi.getGuarantor).not.toHaveBeenCalled();
        });

        it('should handle fetch error', async () => {
            const { getGuarantor } = require('@/services/guarantorApi');
            getGuarantor.mockRejectedValue(new Error('Guarantor not found'));

            const { result } = renderHook(() => useGuarantor('1'), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toBeInstanceOf(Error);
        });
    });

    describe('useGuarantors', () => {
        it('should fetch guarantors list successfully', async () => {
            const { getGuarantors } = require('@/services/guarantorApi');
            getGuarantors.mockResolvedValue(mockPaginatedResponse);

            const { result } = renderHook(() => useGuarantors(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockPaginatedResponse);
            expect(getGuarantors).toHaveBeenCalledWith({});
        });

        it('should fetch guarantors with filters', async () => {
            const { getGuarantors } = require('@/services/guarantorApi');
            getGuarantors.mockResolvedValue(mockPaginatedResponse);

            const filters = {
                search: 'John',
                status: ['verified' as const],
                page: 1,
                limit: 10
            };

            const { result } = renderHook(() => useGuarantors(filters), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(getGuarantors).toHaveBeenCalledWith(filters);
        });

        it('should handle fetch error', async () => {
            const { getGuarantors } = require('@/services/guarantorApi');
            getGuarantors.mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() => useGuarantors(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toBeInstanceOf(Error);
        });
    });

    describe('useCreateGuarantor', () => {
        it('should create guarantor successfully', async () => {
            const { createGuarantor } = require('@/services/guarantorApi');
            createGuarantor.mockResolvedValue(mockGuarantor);

            const { result } = renderHook(() => useCreateGuarantor(), {
                wrapper: createWrapper()
            });

            const createMutation = result.current;

            await waitFor(() => {
                createMutation.mutate(mockFormData);
            });

            await waitFor(() => {
                expect(createMutation.isSuccess).toBe(true);
            });

            expect(createGuarantor).toHaveBeenCalledWith(mockFormData);
        });

        it('should handle create error', async () => {
            const { createGuarantor } = require('@/services/guarantorApi');
            createGuarantor.mockRejectedValue(new Error('Creation failed'));

            const { result } = renderHook(() => useCreateGuarantor(), {
                wrapper: createWrapper()
            });

            const createMutation = result.current;

            createMutation.mutate(mockFormData);

            await waitFor(() => {
                expect(createMutation.isError).toBe(true);
            });

            expect(createMutation.error).toBeInstanceOf(Error);
        });
    });

    describe('useUpdateGuarantor', () => {
        it('should update guarantor successfully', async () => {
            const { updateGuarantor } = require('@/services/guarantorApi');
            const updatedGuarantor = { ...mockGuarantor, guarantor_name: 'Updated Name' };
            updateGuarantor.mockResolvedValue(updatedGuarantor);

            const { result } = renderHook(() => useUpdateGuarantor(), {
                wrapper: createWrapper()
            });

            const updateMutation = result.current;
            const updateData = { guarantor_name: 'Updated Name' };

            updateMutation.mutate({ id: '1', data: updateData });

            await waitFor(() => {
                expect(updateMutation.isSuccess).toBe(true);
            });

            expect(updateGuarantor).toHaveBeenCalledWith('1', updateData);
        });

        it('should handle update error', async () => {
            const { updateGuarantor } = require('@/services/guarantorApi');
            updateGuarantor.mockRejectedValue(new Error('Update failed'));

            const { result } = renderHook(() => useUpdateGuarantor(), {
                wrapper: createWrapper()
            });

            const updateMutation = result.current;

            updateMutation.mutate({ id: '1', data: { guarantor_name: 'Test' } });

            await waitFor(() => {
                expect(updateMutation.isError).toBe(true);
            });

            expect(updateMutation.error).toBeInstanceOf(Error);
        });
    });

    describe('useDeleteGuarantor', () => {
        it('should delete guarantor successfully', async () => {
            const { deleteGuarantor } = require('@/services/guarantorApi');
            deleteGuarantor.mockResolvedValue(undefined);

            const { result } = renderHook(() => useDeleteGuarantor(), {
                wrapper: createWrapper()
            });

            const deleteMutation = result.current;

            deleteMutation.mutate('1');

            await waitFor(() => {
                expect(deleteMutation.isSuccess).toBe(true);
            });

            expect(deleteGuarantor).toHaveBeenCalledWith('1');
        });

        it('should handle delete error', async () => {
            const { deleteGuarantor } = require('@/services/guarantorApi');
            deleteGuarantor.mockRejectedValue(new Error('Delete failed'));

            const { result } = renderHook(() => useDeleteGuarantor(), {
                wrapper: createWrapper()
            });

            const deleteMutation = result.current;

            deleteMutation.mutate('1');

            await waitFor(() => {
                expect(deleteMutation.isError).toBe(true);
            });

            expect(deleteMutation.error).toBeInstanceOf(Error);
        });
    });

    describe('useDashboardStats', () => {
        it('should fetch dashboard stats successfully', async () => {
            const { getDashboardStats } = require('@/services/guarantorApi');
            getDashboardStats.mockResolvedValue(mockDashboardStats);

            const { result } = renderHook(() => useDashboardStats(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockDashboardStats);
            expect(getDashboardStats).toHaveBeenCalled();
        });

        it('should handle stats fetch error', async () => {
            const { getDashboardStats } = require('@/services/guarantorApi');
            getDashboardStats.mockRejectedValue(new Error('Stats fetch failed'));

            const { result } = renderHook(() => useDashboardStats(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toBeInstanceOf(Error);
        });
    });
});
