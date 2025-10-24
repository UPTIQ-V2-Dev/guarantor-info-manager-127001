import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createGuarantor,
    updateGuarantor,
    getGuarantor,
    getGuarantors,
    deleteGuarantor,
    getDashboardStats,
    sendForVerification,
    exportGuarantors
} from '@/services/guarantorApi';
import type { CreateGuarantorInput, UpdateGuarantorInput, GuarantorSearchFilters } from '@/types/guarantor';

// Query keys
const QUERY_KEYS = {
    guarantors: 'guarantors',
    guarantor: 'guarantor',
    dashboard: 'dashboard'
} as const;

// Get single guarantor
export const useGuarantor = (id: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.guarantor, id],
        queryFn: () => getGuarantor(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2
    });
};

// Get paginated list of guarantors
export const useGuarantors = (filters: GuarantorSearchFilters = {}) => {
    return useQuery({
        queryKey: [QUERY_KEYS.guarantors, filters],
        queryFn: () => getGuarantors(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2
    });
};

// Get dashboard statistics
export const useDashboardStats = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.dashboard],
        queryFn: getDashboardStats,
        staleTime: 1 * 60 * 1000, // 1 minute
        retry: 2
    });
};

// Create new guarantor
export const useCreateGuarantor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateGuarantorInput) => createGuarantor(data),
        onSuccess: newGuarantor => {
            // Invalidate and refetch guarantor list
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.guarantors] });
            // Invalidate dashboard stats
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dashboard] });
            // Set the new guarantor data in cache
            queryClient.setQueryData([QUERY_KEYS.guarantor, newGuarantor.id], newGuarantor);
        },
        onError: error => {
            console.error('Failed to create guarantor:', error);
        }
    });
};

// Update existing guarantor
export const useUpdateGuarantor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateGuarantorInput }) => updateGuarantor(id, data),
        onSuccess: updatedGuarantor => {
            // Update the specific guarantor in cache
            queryClient.setQueryData([QUERY_KEYS.guarantor, updatedGuarantor.id], updatedGuarantor);
            // Invalidate guarantor list to reflect changes
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.guarantors] });
            // Invalidate dashboard if status changed
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dashboard] });
        },
        onError: error => {
            console.error('Failed to update guarantor:', error);
        }
    });
};

// Delete guarantor
export const useDeleteGuarantor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteGuarantor(id),
        onSuccess: (_, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.guarantor, deletedId] });
            // Invalidate guarantor list
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.guarantors] });
            // Invalidate dashboard
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dashboard] });
        },
        onError: error => {
            console.error('Failed to delete guarantor:', error);
        }
    });
};

// Send guarantor for verification
export const useSendForVerification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => sendForVerification(id),
        onSuccess: (_, id) => {
            // Invalidate the specific guarantor to refetch updated status
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.guarantor, id] });
            // Invalidate guarantor list
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.guarantors] });
            // Invalidate dashboard stats
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dashboard] });
        },
        onError: error => {
            console.error('Failed to send for verification:', error);
        }
    });
};

// Export guarantors
export const useExportGuarantors = () => {
    return useMutation({
        mutationFn: ({
            filters,
            format = 'csv'
        }: {
            filters?: GuarantorSearchFilters;
            format?: 'csv' | 'xlsx' | 'json';
        }) => exportGuarantors(filters, format),
        onError: error => {
            console.error('Failed to export guarantors:', error);
        }
    });
};

// Utility hook to prefetch guarantor data
export const usePrefetchGuarantor = () => {
    const queryClient = useQueryClient();

    return (id: string) => {
        queryClient.prefetchQuery({
            queryKey: [QUERY_KEYS.guarantor, id],
            queryFn: () => getGuarantor(id),
            staleTime: 5 * 60 * 1000
        });
    };
};

// Utility hook for optimistic updates
export const useOptimisticGuarantorUpdate = () => {
    const queryClient = useQueryClient();

    return (id: string, updatedData: Partial<UpdateGuarantorInput>) => {
        queryClient.setQueryData([QUERY_KEYS.guarantor, id], (old: any) => {
            if (!old) return old;
            return { ...old, ...updatedData };
        });
    };
};
