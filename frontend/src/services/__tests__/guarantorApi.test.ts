import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as guarantorApi from '../guarantorApi';
import { mockGuarantor, mockPaginatedResponse, mockDashboardStats, mockFormData } from '@/test/mocks/mockData';

// Mock the api module
vi.mock('@/lib/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}));

describe('guarantorApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.unstubAllEnvs();
    });

    describe('createGuarantor', () => {
        it('should create a new guarantor when using mock data', async () => {
            vi.stubEnv('VITE_USE_MOCK_DATA', 'true');

            const result = await guarantorApi.createGuarantor(mockFormData);

            expect(result).toMatchObject({
                guarantor_name: mockFormData.guarantor_name,
                relationship_to_borrower: mockFormData.relationship_to_borrower,
                record_status: 'pending_verification'
            });
            expect(result.id).toBeDefined();
            expect(result.submission_timestamp).toBeDefined();
        });

        it('should handle API call when not using mock data', async () => {
            vi.stubEnv('VITE_USE_MOCK_DATA', 'false');
            const { api } = await import('@/lib/api');
            const mockResponse = { data: mockGuarantor };
            vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

            const result = await guarantorApi.createGuarantor(mockFormData);

            expect(api.post).toHaveBeenCalledWith('/api/guarantors', mockFormData);
            expect(result).toEqual(mockGuarantor);
        });
    });

    describe('getGuarantors', () => {
        it('should return paginated guarantors with mock data', async () => {
            vi.stubEnv('VITE_USE_MOCK_DATA', 'true');

            const result = await guarantorApi.getGuarantors();

            expect(result).toMatchObject({
                results: expect.any(Array),
                page: 1,
                limit: 10,
                totalPages: expect.any(Number),
                totalResults: expect.any(Number)
            });
        });

        it('should apply search filters correctly with mock data', async () => {
            vi.stubEnv('VITE_USE_MOCK_DATA', 'true');

            const filters = {
                search: 'Michael',
                status: ['verified' as const]
            };

            const result = await guarantorApi.getGuarantors(filters);

            expect(result.results).toBeDefined();
            expect(Array.isArray(result.results)).toBe(true);
        });

        it('should make correct API call when not using mock data', async () => {
            vi.stubEnv('VITE_USE_MOCK_DATA', 'false');
            const { api } = await import('@/lib/api');
            vi.mocked(api.get).mockResolvedValueOnce({ data: mockPaginatedResponse });

            const filters = { page: 1, limit: 10 };
            const result = await guarantorApi.getGuarantors(filters);

            expect(api.get).toHaveBeenCalledWith('/api/guarantors?page=1&limit=10');
            expect(result).toEqual(mockPaginatedResponse);
        });
    });

    describe('getGuarantor', () => {
        it('should return single guarantor with mock data', async () => {
            vi.stubEnv('VITE_USE_MOCK_DATA', 'true');

            // This should find the mock guarantor or throw error
            await expect(guarantorApi.getGuarantor('non-existent')).rejects.toThrow('Guarantor not found');
        });

        it('should make correct API call when not using mock data', async () => {
            vi.stubEnv('VITE_USE_MOCK_DATA', 'false');
            const { api } = await import('@/lib/api');
            vi.mocked(api.get).mockResolvedValueOnce({ data: mockGuarantor });

            const result = await guarantorApi.getGuarantor('1');

            expect(api.get).toHaveBeenCalledWith('/api/guarantors/1');
            expect(result).toEqual(mockGuarantor);
        });
    });

    describe('updateGuarantor', () => {
        it('should update guarantor with mock data', async () => {
            vi.stubEnv('VITE_USE_MOCK_DATA', 'true');

            const updateData = { guarantor_name: 'Updated Name' };

            // Should throw error for non-existent guarantor
            await expect(guarantorApi.updateGuarantor('non-existent', updateData)).rejects.toThrow(
                'Guarantor not found'
            );
        });

        it('should make correct API call when not using mock data', async () => {
            vi.stubEnv('VITE_USE_MOCK_DATA', 'false');
            const { api } = await import('@/lib/api');
            const updatedGuarantor = { ...mockGuarantor, guarantor_name: 'Updated Name' };
            vi.mocked(api.put).mockResolvedValueOnce({ data: updatedGuarantor });

            const updateData = { guarantor_name: 'Updated Name' };
            const result = await guarantorApi.updateGuarantor('1', updateData);

            expect(api.put).toHaveBeenCalledWith('/api/guarantors/1', updateData);
            expect(result).toEqual(updatedGuarantor);
        });
    });

    describe('deleteGuarantor', () => {
        it('should delete guarantor with mock data', async () => {
            vi.stubEnv('VITE_USE_MOCK_DATA', 'true');

            // Should throw error for non-existent guarantor
            await expect(guarantorApi.deleteGuarantor('non-existent')).rejects.toThrow('Guarantor not found');
        });

        it('should make correct API call when not using mock data', async () => {
            vi.stubEnv('VITE_USE_MOCK_DATA', 'false');
            const { api } = await import('@/lib/api');
            vi.mocked(api.delete).mockResolvedValueOnce(undefined);

            await guarantorApi.deleteGuarantor('1');

            expect(api.delete).toHaveBeenCalledWith('/api/guarantors/1');
        });
    });

    describe('getDashboardStats', () => {
        it('should return dashboard stats with mock data', async () => {
            vi.stubEnv('VITE_USE_MOCK_DATA', 'true');

            const result = await guarantorApi.getDashboardStats();

            expect(result).toMatchObject({
                total_submissions: expect.any(Number),
                pending_verification: expect.any(Number),
                in_review: expect.any(Number),
                verified: expect.any(Number),
                rejected: expect.any(Number),
                recent_submissions: expect.any(Array)
            });
        });

        it('should make correct API call when not using mock data', async () => {
            vi.stubEnv('VITE_USE_MOCK_DATA', 'false');
            const { api } = await import('@/lib/api');
            vi.mocked(api.get).mockResolvedValueOnce({ data: mockDashboardStats });

            const result = await guarantorApi.getDashboardStats();

            expect(api.get).toHaveBeenCalledWith('/api/dashboard/stats');
            expect(result).toEqual(mockDashboardStats);
        });
    });

    describe('sendForVerification', () => {
        it('should send guarantor for verification with mock data', async () => {
            vi.stubEnv('VITE_USE_MOCK_DATA', 'true');

            const result = await guarantorApi.sendForVerification('1');

            expect(result).toEqual({
                message: 'Guarantor sent for background verification successfully'
            });
        });

        it('should make correct API call when not using mock data', async () => {
            vi.stubEnv('VITE_USE_MOCK_DATA', 'false');
            const { api } = await import('@/lib/api');
            const mockResponse = { message: 'Success' };
            vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

            const result = await guarantorApi.sendForVerification('1');

            expect(api.post).toHaveBeenCalledWith('/api/guarantors/1/verify');
            expect(result).toEqual(mockResponse);
        });
    });

    describe('exportGuarantors', () => {
        it('should export guarantors with mock data', async () => {
            vi.stubEnv('VITE_USE_MOCK_DATA', 'true');

            const result = await guarantorApi.exportGuarantors();

            expect(result).toBeInstanceOf(Blob);
            expect(result.type).toBe('text/csv');
        });

        it('should make correct API call when not using mock data', async () => {
            vi.stubEnv('VITE_USE_MOCK_DATA', 'false');
            const { api } = await import('@/lib/api');
            const mockBlob = new Blob(['test data'], { type: 'text/csv' });
            vi.mocked(api.post).mockResolvedValueOnce({ data: mockBlob });

            const result = await guarantorApi.exportGuarantors({}, 'csv');

            expect(api.post).toHaveBeenCalledWith('/api/guarantors/export?format=csv', {}, { responseType: 'blob' });
            expect(result).toEqual(mockBlob);
        });
    });
});
