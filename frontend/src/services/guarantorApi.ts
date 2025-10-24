import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/types/api';
import type {
    GuarantorSubmission,
    CreateGuarantorInput,
    UpdateGuarantorInput,
    GuarantorSearchFilters,
    GuarantorDashboardStats,
    GuarantorAttachment
} from '@/types/guarantor';
import { mockGuarantorSubmissions, mockDashboardStats } from '@/data/guarantorMockData';

// Helper function to build query params
const buildQueryParams = (filters: GuarantorSearchFilters = {}): string => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
                value.forEach(v => params.append(key, v));
            } else {
                params.append(key, value.toString());
            }
        }
    });

    return params.toString();
};

// Create new guarantor submission
export const createGuarantor = async (data: CreateGuarantorInput): Promise<GuarantorSubmission> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        // Mock implementation
        const newGuarantor: GuarantorSubmission = {
            id: Math.random().toString(36).substr(2, 9),
            ...data,
            submission_timestamp: new Date().toISOString(),
            submitted_by: 'current_user',
            record_status: 'pending_verification',
            known_associations: data.known_associations || [],
            comments: data.comments || '',
            linkedin_profile: data.linkedin_profile || '',
            company_registration_number: data.company_registration_number || ''
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return newGuarantor;
    }

    const response = await api.post<GuarantorSubmission>('/api/guarantors', data);
    return response.data;
};

// Update existing guarantor
export const updateGuarantor = async (id: string, data: UpdateGuarantorInput): Promise<GuarantorSubmission> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        // Mock implementation
        const existing = mockGuarantorSubmissions.find(g => g.id === id);
        if (!existing) {
            throw new Error('Guarantor not found');
        }

        const updated = { ...existing, ...data };
        await new Promise(resolve => setTimeout(resolve, 800));
        return updated;
    }

    const response = await api.put<GuarantorSubmission>(`/api/guarantors/${id}`, data);
    return response.data;
};

// Get guarantor by ID
export const getGuarantor = async (id: string): Promise<GuarantorSubmission> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        // Mock implementation
        const guarantor = mockGuarantorSubmissions.find(g => g.id === id);
        if (!guarantor) {
            throw new Error('Guarantor not found');
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        return guarantor;
    }

    const response = await api.get<GuarantorSubmission>(`/api/guarantors/${id}`);
    return response.data;
};

// Get paginated list of guarantors with filters
export const getGuarantors = async (
    filters: GuarantorSearchFilters = {}
): Promise<PaginatedResponse<GuarantorSubmission>> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        // Mock implementation with filtering
        let filteredData = [...mockGuarantorSubmissions];

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredData = filteredData.filter(
                g =>
                    g.guarantor_name.toLowerCase().includes(searchLower) ||
                    g.relationship_to_borrower.toLowerCase().includes(searchLower) ||
                    g.occupation.toLowerCase().includes(searchLower) ||
                    g.employer_or_business.toLowerCase().includes(searchLower)
            );
        }

        // Apply status filter
        if (filters.status && filters.status.length > 0) {
            filteredData = filteredData.filter(g => filters.status!.includes(g.record_status));
        }

        // Apply date filters
        if (filters.dateFrom) {
            filteredData = filteredData.filter(g => new Date(g.submission_timestamp) >= new Date(filters.dateFrom!));
        }

        if (filters.dateTo) {
            filteredData = filteredData.filter(g => new Date(g.submission_timestamp) <= new Date(filters.dateTo!));
        }

        // Apply sorting
        if (filters.sortBy) {
            filteredData.sort((a, b) => {
                const aValue = (a as any)[filters.sortBy!];
                const bValue = (b as any)[filters.sortBy!];

                if (filters.sortOrder === 'desc') {
                    return bValue > aValue ? 1 : -1;
                }
                return aValue > bValue ? 1 : -1;
            });
        }

        // Apply pagination
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            results: paginatedData,
            page,
            limit,
            totalPages: Math.ceil(filteredData.length / limit),
            totalResults: filteredData.length
        };
    }

    const queryParams = buildQueryParams(filters);
    const response = await api.get<PaginatedResponse<GuarantorSubmission>>(`/api/guarantors?${queryParams}`);
    return response.data;
};

// Delete guarantor
export const deleteGuarantor = async (id: string): Promise<void> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        // Mock implementation
        const index = mockGuarantorSubmissions.findIndex(g => g.id === id);
        if (index === -1) {
            throw new Error('Guarantor not found');
        }

        await new Promise(resolve => setTimeout(resolve, 600));
        return;
    }

    await api.delete(`/api/guarantors/${id}`);
};

// Get dashboard statistics
export const getDashboardStats = async (): Promise<GuarantorDashboardStats> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 600));
        return mockDashboardStats;
    }

    const response = await api.get<GuarantorDashboardStats>('/api/dashboard/stats');
    return response.data;
};

// Upload attachment for guarantor
export const uploadGuarantorAttachment = async (
    guarantorId: string,
    file: File,
    attachmentType: string,
    onProgress?: (progress: number) => void
): Promise<GuarantorAttachment> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        // Mock implementation with progress simulation
        const mockAttachment: GuarantorAttachment = {
            id: Math.random().toString(36).substr(2, 9),
            filename: file.name,
            file_type: file.type,
            file_size: file.size,
            upload_date: new Date().toISOString(),
            attachment_type: attachmentType as any,
            file_url: `/api/files/${Math.random().toString(36).substr(2, 9)}`
        };

        // Simulate upload progress
        if (onProgress) {
            for (let i = 0; i <= 100; i += 10) {
                onProgress(i);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return mockAttachment;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('attachment_type', attachmentType);

    const response = await api.post<GuarantorAttachment>(`/api/guarantors/${guarantorId}/attachments`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
            if (onProgress && progressEvent.total) {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(progress);
            }
        }
    });

    return response.data;
};

// Send guarantor for background verification
export const sendForVerification = async (id: string): Promise<{ message: string }> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { message: 'Guarantor sent for background verification successfully' };
    }

    const response = await api.post<{ message: string }>(`/api/guarantors/${id}/verify`);
    return response.data;
};

// Export guarantors data
export const exportGuarantors = async (
    filters: GuarantorSearchFilters = {},
    format: 'csv' | 'xlsx' | 'json' = 'csv'
): Promise<Blob> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        // Mock implementation - return a simple CSV
        const csvData = mockGuarantorSubmissions
            .map(g =>
                [
                    g.guarantor_name,
                    g.relationship_to_borrower,
                    `"${g.address.street}, ${g.address.city}, ${g.address.state} ${g.address.zip}"`,
                    g.occupation,
                    g.employer_or_business,
                    g.record_status,
                    g.submission_timestamp
                ].join(',')
            )
            .join('\n');

        const header = 'Name,Relationship,Address,Occupation,Employer,Status,Date\n';

        await new Promise(resolve => setTimeout(resolve, 1500));
        return new Blob([header + csvData], { type: 'text/csv' });
    }

    const queryParams = buildQueryParams(filters);
    const queryString = queryParams ? `${queryParams}&format=${format}` : `format=${format}`;
    const response = await api.post<Blob>(`/api/guarantors/export?${queryString}`, {}, { responseType: 'blob' });

    return response.data;
};
